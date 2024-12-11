from langchain_pinecone import PineconeVectorStore
from openai import OpenAI
import yfinance as yf
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from pinecone.grpc import PineconeGRPC as Pinecone
import os
from dotenv import load_dotenv
import logging
from typing import Optional, Dict
from fastapi.middleware.cors import CORSMiddleware



load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


logger = logging.getLogger(__name__)

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=GROQ_API_KEY
)

pinecone_client = Pinecone(
    api_key=PINECONE_API_KEY, 
    environment="us-east-1"  
)
index_name = "stocks"
pinecone_index = pinecone_client.Index(index_name)
namespace = "stock-descriptions"
hf_embeddings = HuggingFaceEmbeddings()
vectorstore = PineconeVectorStore(index_name=index_name, embedding=hf_embeddings)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs (e.g., specify allowed origins)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

def get_huggingface_embeddings(text, model_name="sentence-transformers/all-mpnet-base-v2"):
    """
    Generates embeddings for the given text using a specified Hugging Face model.

    Args:
        text (str): The input text to generate embeddings for.
        model_name (str): The name of the Hugging Face model to use.
                          Defaults to "sentence-transformers/all-mpnet-base-v2".

    Returns:
        np.ndarray: The generated embeddings as a NumPy array.
    """
    model = SentenceTransformer(model_name)
    return model.encode(text)


def cosine_similarity_between_sentences(sentence1, sentence2):
    """
    Calculates the cosine similarity between two sentences.

    Args:
        sentence1 (str): The first sentence for similarity comparison.
        sentence2 (str): The second sentence for similarity comparison.

    Returns:
        float: The cosine similarity score between the two sentences,
               ranging from -1 (completely opposite) to 1 (identical).

    Notes:
        Prints the similarity score to the console in a formatted string.
    """
    # Get embeddings for both sentences
    embedding1 = np.array(get_huggingface_embeddings(sentence1))
    embedding2 = np.array(get_huggingface_embeddings(sentence2))
    #print("embedding1", embedding1)

    # Reshape embeddings for cosine_similarity function
    embedding1 = embedding1.reshape(1, -1)
    embedding2 = embedding2.reshape(1, -1)
    #print("embedding1 reshape", embedding1)

    # Calculate cosine similarity
    similarity = cosine_similarity(embedding1, embedding2)
    similarity_score = similarity[0][0]
    print(f"Cosine similarity between the two sentences: {similarity_score:.4f}")
    return similarity_score

def perform_rag(query, filter_criteria):
    raw_query_embedding = get_huggingface_embeddings(query)
    
    top_matches = pinecone_index.query(
        vector=raw_query_embedding.tolist(),
        top_k=5,
        include_metadata=True,
        namespace=namespace,
        filter=filter_criteria)
    
    contexts = [item['metadata']['text'] for item in top_matches['matches']]
    augmented_query = "<CONTEXT>\n" + "\n\n-------\n\n".join(contexts[ : 10]) + "\n-------\n</CONTEXT>\n\n\n\nMY QUESTION:\n" + query
    system_prompt = f"""
        You are a friendly and empathetic financial advisor with expertise in stock market analysis.
        Provide clear and helpful answers to the questions asked, offering thoughtful recommendations tailored to the context.
        Respond in an approachable yet professional tone, ensuring that your advice is cautious and well-considered to support informed decision-making.
        Think step by step.
        """
    llm_response = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": augmented_query}
        ]
    )
    #print(top_matches)
    return {
        "response": llm_response.choices[0].message.content,
        "top_matches": top_matches.to_dict()  # Añadir top_matches a la respuesta
    }

class QueryFilters(BaseModel):
    market_cap_min: Optional[float] = None
    market_cap_max: Optional[float] = None
    volume_min: Optional[float] = None
    volume_max: Optional[float] = None
    sector: Optional[str] = None
    entreprise_value_min: Optional[float] = None
    entreprise_value_max: Optional[float] = None

class RAGQuery(BaseModel):
    query: str
    filters: Optional[QueryFilters] = None



@app.post("/perform_rag")
async def rag_query(data: RAGQuery ):
    try:
        pinecone_filters = {}
        filters = data.filters
        print(data)
        if filters:
            filters = filters.dict(exclude_none=True)

            if "market_cap_min" in filters:
                pinecone_filters["Market Capitalization"] = {"$gte": filters["market_cap_min"]}
            if "market_cap_max" in filters:
                pinecone_filters["Market Capitalization"]["$lte"] = filters["market_cap_max"]
            if "sector" in filters:
                pinecone_filters["Sector"] = {"$eq": filters["sector"]}
            if "volume_min" in filters:
                pinecone_filters["Average"] = {"$gte": filters["volume_min"]}
            if "volume_max" in filters:
                pinecone_filters["Average"]["$lte"] = filters["volume_max"]
            if "entreprise_value_min" in filters:
                pinecone_filters["Enterprise Value"] = {"$gte": filters["entreprise_value_min"]}
            if "entreprise_value_max" in filters:
                pinecone_filters["Enterprise Value"]["$lte"] = filters["entreprise_value_max"]

        print(pinecone_filters)

        response = perform_rag(data.query, pinecone_filters)
        #print(response)
        return {
            "query": data.query,
            "response": response["response"],  # Assuming response_data is a dict
            "top_matches": response["top_matches"]  # Ensure this is also serializable
        }
    except Exception as e:
        logger.error(f"Error ejecutando perform_rag: {e}")
        raise HTTPException(status_code=500, detail=f"Error performing rag: {str(e)}")