# Copilot Instructions for personal_assistant

## Build and Run

- **Install dependencies:** `pip install google-adk langchain-community wikipedia`
- **Run CLI:** `adk run personal_assistant`
- **Run Web UI:** `adk web`
- **Configuration:** Set environment variables in `.env` (GOOGLE_API_KEY or GOOGLE_CLOUD_PROJECT/LOCATION).

## High-Level Architecture

This project implements a hierarchical AI agent using the Google Agent Development Kit (ADK).

- **Root Agent (`agent.py`):** The main entry point (`root_agent`) that orchestrates task execution. It delegates specific tasks to sub-agents or tools.
- **Sub-Agents (`custom_agents.py`):** Specialized agents (e.g., `google_search_agent`) that handle specific domains like real-time information retrieval. These are wrapped as `AgentTool` for the root agent.
- **Custom Tools (`custom_functions.py`):** Python functions (e.g., `get_exchange_rate`) exposed as tools to the agent via `FunctionTool`.
- **Third-Party Tools (`third_party_tools.py`):** Integration with external libraries like LangChain (e.g., `langchain_wikipedia_tool`), wrapped as `LangchainTool`.

## Key Conventions

- **Agent Definition:**
  - Use `google.adk.agents.llm_agent.Agent` or `google.adk.agents.Agent` to define agents.
  - Always provide a descriptive `name`, `description`, and `instruction` for each agent to guide its behavior and tool selection.
  - The model is explicitly set (e.g., `model='gemini-2.5-flash'`).

- **Tool Wrapping:**
  - **Python Functions:** Wrap standalone functions with `google.adk.tools.FunctionTool`. Ensure the function has type hints and a docstring describing its purpose and arguments.
  - **Sub-Agents:** Wrap other ADK agents with `google.adk.tools.agent_tool.AgentTool` to allow the root agent to delegate tasks to them.
  - **LangChain:** Wrap LangChain tools with `google.adk.tools.langchain_tool.LangchainTool`. Update the tool's `.description` if necessary to improve selection accuracy.

- **Modularity:**
  - Keep the root agent definition in `agent.py`.
  - Place sub-agents in `custom_agents.py`.
  - Place python function tools in `custom_functions.py`.
  - Place third-party integrations in `third_party_tools.py`.
