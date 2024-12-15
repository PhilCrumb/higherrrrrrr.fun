import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    API_KEY = os.getenv('API_KEY')
    AUTH_TOKEN = os.getenv('AUTH_TOKEN')
    CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
    HIGHLIGHTED_TOKENS = os.getenv('HIGHLIGHTED_TOKENS')
    RPC_URL = os.getenv('RPC_URL', 'https://mainnet.base.org')
    TOKENS_SUBGRAPH_URL = os.getenv('TOKENS_SUBGRAPH_URL', 'https://subgraph.satsuma-prod.com/2ed3e01ead05/carls-team/tokens/version/v0.0.1/api')
    DUNE_API_KEY = os.getenv('DUNE_API_KEY')
    TOKEN_BLACKLIST = os.getenv('TOKEN_BLACKLIST')
    BLACKLISTED_TOKENS = os.getenv('BLACKLISTED_TOKENS', '')
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres@localhost:5432/tokens_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # OpenRouter API configuration
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')


