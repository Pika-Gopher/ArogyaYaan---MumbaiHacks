import uuid
from langchain_core.messages import HumanMessage
from db.db import db_client
# Import the main_agent graph we built in main.py
from main import main_agent

def run_daily_replenishment_cycle():
    print("==================================================")
    print("🚀 AROGYAYAAN: STARTING DAILY STOCK MONITORING")
    print("==================================================")

    # 1. Query DB for At-Risk Stock
    alerts = db_client.get_low_stock_alerts(days_forecast=3)

    if not alerts:
        print("✅ No immediate stock risks detected today.")
        return

    # 2. Iterate through every alert and trigger the AI Agent
    for i, alert in enumerate(alerts):
        print(f"\n\n>>> ⚠️ PROCESSING ALERT {i+1}/{len(alerts)}: {alert['medicine']} for {alert['phc_name']}")
        
        # Generate a unique thread ID for this specific task so memory doesn't mix
        thread_id = f"auto_job_{uuid.uuid4()}"
        config = {"configurable": {"thread_id": thread_id}}

        # Construct the prompt exactly how the Supervisor expects it
        task_prompt = (
            f"Request: Need {alert['quantity']} units of {alert['medicine']} "
            f"at {alert['requestor_phc']}. Find the best donor and create a solution card."
        )

        try:
            # 3. Invoke the Supervisor Agent (The Graph)
            final_state = main_agent.invoke(
                {"messages": [HumanMessage(content=task_prompt)]},
                config=config
            )
            
            # Extract the AI's final response for the logs
            ai_response = final_state['messages'][-1].content
            print(f"✅ ACTION TAKEN: {ai_response}")

        except Exception as e:
            print(f"❌ ERROR processing alert for {alert['requestor_phc']}: {e}")

    print("\n==================================================")
    print("🏁 AROGYAYAAN: BATCH CYCLE COMPLETE")
    print("==================================================")

if __name__ == "__main__":
    run_daily_replenishment_cycle()