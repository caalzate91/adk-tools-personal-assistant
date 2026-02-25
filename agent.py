from google.adk.agents.llm_agent import Agent
from google.adk.tools import FunctionTool
from google.adk.tools.agent_tool import AgentTool
from google.adk.tools.langchain_tool import LangchainTool

from personal_assistant.custom_functions import get_exchange_rate
from personal_assistant.custom_agents import google_search_agent
from personal_assistant.third_party_tools import langchain_wikipedia_tool

root_agent = Agent(
    model='gemini-2.5-flash',
    name='root_agent',
    description='A helpful assistant for user questions.',
    instruction='Answer user questions to the best of your knowledge',
    tools=[
        FunctionTool(get_exchange_rate),
        AgentTool(agent=google_search_agent),
        LangchainTool(langchain_wikipedia_tool),
    ]
)
