# ArogyaYaan ML Agent System

ArogyaYaan is an intelligent multi-agent system designed to optimize medicine distribution across Primary Health Centers (PHCs). It uses AI-powered decision-making to find the best donors for stock transfer requests, considering inventory levels, logistics, and real-time weather conditions.

## Agent Architecture

The system implements a hierarchical multi-agent architecture using LangChain and DeepAgents:

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPERVISOR AGENT                         │
│  (Coordinates workflow, selects best donor, creates cards)  │
└─────────────────┬───────────────────────┬───────────────────┘
                  │                       │
    ┌─────────────▼─────────────┐ ┌───────▼───────────────────┐
    │      ANALYST AGENT        │ │     LOGISTICS AGENT       │
    │  (Finds surplus donors)   │ │  (Calculates routes &     │
    │                           │ │   checks constraints)     │
    └───────────────────────────┘ └───────────────────────────┘
```

### Supervisor Agent

The main orchestrator that:
1. Requests a list of potential donors from the Analyst
2. Gathers logistics data for the top 5 candidates
3. Compares and selects the best donor based on:
   - **Feasibility**: Rejects routes with FAIL constraints
   - **Speed**: Prefers the fastest route
   - **Weather**: Avoids bad weather routes if alternatives exist
   - **Surplus**: Picks higher surplus when times are similar
4. Creates a solution card documenting the final decision

### Analyst Sub-Agent

Responsible for inventory analysis:
- Queries the database for PHCs with surplus stock
- Calculates **True Surplus** using the formula:
  ```
  True Surplus = Current_Stock - (Safety_Stock + 7_Day_Burn_Forecast)
  ```
- Returns a ranked list of valid donor candidates

### Logistics Sub-Agent

Handles route planning and compliance:
- Fetches live weather data via Open-Meteo API
- Calculates driving distance using Google Maps API (with Haversine fallback)
- Estimates travel time with weather-based adjustments (30% slower in adverse conditions)
- Retrieves SOPs and constraints from the knowledge base

## Tools

| Tool | Agent | Description |
|------|-------|-------------|
| `find_surplus_donors` | Analyst | Finds PHCs with sufficient surplus stock |
| `get_logistics_plan` | Logistics, Supervisor | Calculates route, time, and constraints |
| `create_solution_card` | Supervisor | Saves the final transfer decision to DB |

## API Endpoints

### Flask Server (`app.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check for the service |
| `/api/request-stock` | POST | Trigger the agent for a stock transfer request |
| `/auto` | GET | Run the daily automated replenishment cycle |

#### Request Stock Example

```json
POST /api/request-stock
{
    "requestor_phc": "Paltan Road Health Post",
    "medicine": "Insulin",
    "quantity": 50
}
```

## Automated Replenishment (`autodb.py`)

The system includes a daily monitoring job that:
1. Queries the database for PHCs with stock levels projected to fall below safety thresholds within 3 days
2. Automatically triggers the AI agent for each at-risk facility
3. Creates solution cards for proactive stock transfers

## Database Schema

The system uses PostgreSQL (Supabase) with the following key tables:
- `facilities`: PHC information and locations
- `items`: Medicine catalog
- `inventories`: Current stock levels, safety stock, and consumption rates
- `knowledge_base`: SOPs, constraints, and logistics rules
- `solution_cards`: AI-generated transfer recommendations

## Configuration

Required environment variables (set in `.env`):

```
GEMINI_API_KEY=<your-gemini-api-key>
SUPABASE_DB_URL=<your-supabase-connection-string>
GOOGLE_MAPS_API_KEY=<your-maps-api-key>
GROQ_API_KEY=<your-groq-api-key>
```

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   Or with uv:
   ```bash
   uv sync
   ```

2. Set up environment variables in `.env`

3. Run the Flask server:
   ```bash
   python app.py
   ```

4. Or run directly:
   ```bash
   python main.py
   ```

## Technology Stack

- **LLM**: Groq (OpenAI GPT OSS 120B)
- **Agent Framework**: DeepAgents, LangChain
- **Database**: PostgreSQL (Supabase)
- **APIs**: Google Maps (routing), Open-Meteo (weather)
- **Web Framework**: Flask with CORS support
- **Vector Store**: FAISS (for SOP retrieval)
