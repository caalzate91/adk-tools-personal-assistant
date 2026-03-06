FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy Python dependencies
COPY pyproject.toml ./
COPY uv.lock* ./

# Install Python dependencies
RUN uv sync --no-dev

# Copy application code
COPY agent.py ./
COPY custom_agents.py ./
COPY custom_functions.py ./
COPY third_party_tools.py ./
COPY __init__.py ./

# Expose ADK server port
EXPOSE 8000

# Run the ADK server
CMD ["uv", "run", "adk", "web", "personal_assistant"]
