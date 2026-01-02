import os
import json
from deepagents import create_deep_agent, CompiledSubAgent
from langchain_groq import ChatGroq
from tools.tools import analyst_tools, logistics_tools, supervisor_tools
from langchain_core.messages import HumanMessage
from config import GROQ_API_KEY

llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)

# Analyst: Returns the LIST of donors (not just one)
analyst_agent_graph = create_deep_agent(
    model=llm,
    tools=analyst_tools,
    system_prompt="""You are the Inventory Analyst.
    Your GOAL is to find ALL PHCs with TRUE SURPLUS.
    1. Use 'find_surplus_donors'.
    2. Return the FULL JSON LIST of candidates so the Supervisor can choose.
    3. If no donors found, return:
        {
            "donors": [],
            "status": "NO_SURPLUS"
        }
    """
)

analyst_subagent = CompiledSubAgent(
    name="Analyst",
    description="Returns a list of potential donors with surplus stock.",
    runnable=analyst_agent_graph
)

# Logistics: Returns the Time & Distance
logistics_agent_graph = create_deep_agent(
    model=llm,
    tools=logistics_tools,
    system_prompt="""You are the Compliance Officer.
    Use 'get_logistics_plan' to calculate Time, Distance, and constraints.
    Return the full JSON output."""
)

logistics_subagent = CompiledSubAgent(
    name="Logistics",
    description="Calculates estimated travel time and checks constraints.",
    runnable=logistics_agent_graph
)

supervisor_instructions = """
You are the ArogyaYaan Supervisor.
Your Goal: Find the **FASTEST** and SAFEST solution.

STRATEGY LOOP:
1. **Get Candidates:** Ask 'Analyst' for the list of all valid donors. If none, stop and say "No donors available, cannot fulfill request."
2. **Gather Logistics Data (Batch Check):**
    - From the list, PICK the TOP 5 donors with HIGHEST surplus.
   - Call 'Logistics' (`get_logistics_plan`) for **EACH** of these 5 candidates.
   - Do this to gather Time, Weather, and Distance data for comparison.
3. **Compare & Select:**
   - Evaluate the results based on this priority:
     1. **Feasibility:** Reject any route with "FAIL" constraints.
     2. **Speed:** Prefer the fastest route.
     3. **Weather:** Avoid 'BAD_WEATHER' routes if a 'NORMAL' alternative exists with similar time.
     4. **Surplus:** If times are similar, pick the donor with higher surplus.
   - Select the single BEST donor.
4. **Commit:**
   - Call `create_solution_card` (This is YOUR tool).
   - Pass the full logistics JSON provided by the Logistics agent.
   - In rationale, explicitly mention the Travel Time and the Donor used.
"""

main_agent = create_deep_agent(
    model=llm,
    tools=supervisor_tools,
    subagents=[analyst_subagent, logistics_subagent],
    system_prompt=supervisor_instructions
)

if __name__ == "__main__":
    
    api_request = {
        "requestor_phc": "fac_thane_09",
        "medicine": "Paracetamol",
        "quantity": 50
    }
    
    print(f"\n--- REQUEST RECEIVED: {api_request} ---")
    config = {"configurable": {"thread_id": "req_unique_id_001"}}
    
    initial_message = (
        f"Request: Need {api_request['quantity']} units of {api_request['medicine']} "
        f"at {api_request['requestor_phc']}. Find best donor."
    )
    final_state = main_agent.invoke(
        {"messages": [HumanMessage(content=initial_message)]},
        config=config
    )
        
    print("\nPROCESS COMPLETE.")
    print("Final Response:", final_state['messages'][-1].content)