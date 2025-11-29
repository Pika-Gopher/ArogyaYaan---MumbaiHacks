import os
import uuid
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_core.messages import HumanMessage

from main import main_agent
from autodb import run_daily_replenishment_cycle

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "ArogyaYaan AI Agent"}), 200

@app.route('/api/request-stock', methods=['POST'])
def request_stock():
    """
    Endpoint to trigger the ArogyaYaan Deep Agent.
    
    Expected JSON Body:
    {
        "requestor_phc": "Paltan Road Health Post",
        "medicine": "Insulin",
        "quantity": 50
    }
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid JSON body"}), 400

        requestor = data.get("requestor_phc")
        medicine = data.get("medicine")
        quantity = data.get("quantity")

        if not all([requestor, medicine, quantity]):
            return jsonify({"error": "Missing required fields: requestor_phc, medicine, quantity"}), 400

        # Generate a unique thread ID for this specific request
        # This ensures LangGraph keeps this execution separate from others
        thread_id = str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}

        logger.info(f"🏥 Processing Request [{thread_id}]: {quantity} units of {medicine} for {requestor}")

        # Construct the prompt for the Supervisor
        user_message = (
            f"Request: Need {quantity} units of {medicine} "
            f"at {requestor}. Find best donor."
        )

        # Invoke the Deep Agent
        # The agent will:
        # 1. Analyst -> Check DB for surplus
        # 2. Logistics -> Check Maps & Weather
        # 3. Supervisor -> Create Solution Card in DB
        result = main_agent.invoke(
            {"messages": [HumanMessage(content=user_message)]},
            config=config
        )

        # Extract the final response text from the agent
        final_response_text = result['messages'][-1].content

        logger.info(f"✅ Request [{thread_id}] Complete. Response: {final_response_text[:50]}...")

        return jsonify({
            "status": "success",
            "thread_id": thread_id,
            "agent_response": final_response_text,
            "message": "Stock transfer workflow initiated. Check 'solution_cards' table for details."
        }), 200

    except Exception as e:
        logger.error(f"❌ Error processing request: {str(e)}")
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500
    
@app.route('/auto', methods=['GET'])
def auto_route():
    run_daily_replenishment_cycle()
    return "Daily replenishment cycle executed."

if __name__ == '__main__':
    # Run on port 5000 by default
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)