import os
from langchain.tools import tool, create_retriever_tool
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.utilities import SQLDatabase
from langchain.agents import create_sql_agent

if not os.path.exists('knowledge_base'):
    os.makedirs('knowledge_base')
    # If file smokes
    with open('knowledge_base/sops.txt', 'w') as f:
        f.write("SOP-001: Medicine_A requires cold storage.\nConstraint: PHC_Mumbai cannot accept heavy trucks.")

loader = DirectoryLoader('./knowledge_base', glob="**/*.txt", loader_cls=TextLoader)
raw_documents = loader.load()

if raw_documents:
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    documents = text_splitter.split_documents(raw_documents)
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_documents(documents, embeddings)
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    
    rag_retriever_tool = create_retriever_tool(
        retriever,
        "sop_and_history_retriever",
        "Searches SOPs, constraints, and logistics history. Use to validate transfer compliance."
    )
else:
    print("Warning: Knowledge base is empty.")
    rag_retriever_tool = None

DB_URL = os.environ.get("SUPABASE_DB_URL")
if DB_URL:
    db = SQLDatabase.from_uri(DB_URL)
    sql_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-latest", temperature=0)
    sql_agent_executor = create_sql_agent(
        llm=sql_llm,
        db=db,
        agent_type="tool_calling",
        verbose=True
    )
else:
    sql_agent_executor = None
    print("Warning: SUPABASE_DB_URL not set.")

@tool
def get_inventory_insights(natural_language_query: str) -> str:
    if not sql_agent_executor:
        return "Error: Database not connected."
    try:
        result = sql_agent_executor.invoke({"input": natural_language_query})
        return result["output"]
    except Exception as e:
        return f"Error executing database query: {e}"

analyst_tools = [get_inventory_insights]
logistics_tools = [rag_retriever_tool] if rag_retriever_tool else []