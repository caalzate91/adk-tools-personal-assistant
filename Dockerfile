FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN pip install google-adk langchain-community wikipedia

# Copy application code into an agent directory
WORKDIR /app/personal_assistant
COPY agent.py ./
COPY custom_agents.py ./
COPY custom_functions.py ./
COPY third_party_tools.py ./
COPY __init__.py ./

WORKDIR /app
# Expose ADK server port
EXPOSE 8000

# Run the ADK server
CMD ["adk", "web", "--host", "0.0.0.0", "--allow_origins", "*", "."]
