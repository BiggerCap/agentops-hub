"""
Complete API Testing Script for AgentOps Hub
Tests all features including NEW implementations:
- Authentication
- Tools
- Agents
- Conversations (NEW)
- Documents (Text, YouTube)
- Runs (with conversation memory, web search)
"""

import requests
import json
import time
from typing import Dict, Any, List

BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

# Test results tracking
results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def log_test(name: str, status: str, details: str = "", response_data: Any = None):
    """Log test result"""
    results["tests"].append({
        "name": name,
        "status": status,
        "details": details,
        "response": response_data
    })
    if status == "PASS":
        results["passed"] += 1
        print(f"✅ {name}")
    else:
        results["failed"] += 1
        print(f"❌ {name}: {details}")

def test_health_check():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200 and response.json().get("status") == "ok":
            log_test("Health Check", "PASS", response_data=response.json())
            return True
        else:
            log_test("Health Check", "FAIL", f"Status: {response.status_code}", response.json())
            return False
    except Exception as e:
        log_test("Health Check", "FAIL", str(e))
        return False

def test_register_user():
    """Test user registration"""
    try:
        payload = {
            "email": "test@agentops.com",
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=payload)
        if response.status_code in [200, 201]:
            log_test("Register User", "PASS", response_data=response.json())
            return True
        else:
            log_test("Register User", "FAIL", f"Status: {response.status_code}", response.json())
            return False
    except Exception as e:
        log_test("Register User", "FAIL", str(e))
        return False

def test_login() -> str:
    """Test login and return access token"""
    try:
        payload = {
            "username": "test@agentops.com",
            "password": "TestPass123!"
        }
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            data=payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code == 200:
            token = response.json().get("access_token")
            log_test("Login", "PASS", f"Token obtained", {"token_length": len(token)})
            return token
        else:
            log_test("Login", "FAIL", f"Status: {response.status_code}", response.json())
            return None
    except Exception as e:
        log_test("Login", "FAIL", str(e))
        return None

def test_list_tools(token: str) -> int:
    """Test listing tools and return web_search tool ID"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/tools", headers=headers)
        if response.status_code == 200:
            tools = response.json().get("tools", [])
            web_search_tool = next((t for t in tools if t["name"] == "web_search"), None)
            if web_search_tool:
                log_test("List Tools", "PASS", f"Found {len(tools)} tools, web_search ID: {web_search_tool['id']}", {"count": len(tools)})
                return web_search_tool["id"]
            else:
                log_test("List Tools", "FAIL", "web_search tool not found", tools)
                return None
        else:
            log_test("List Tools", "FAIL", f"Status: {response.status_code}", response.json())
            return None
    except Exception as e:
        log_test("List Tools", "FAIL", str(e))
        return None

def test_create_agent(token: str, tool_id: int) -> int:
    """Test creating agent with web search"""
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "name": "Test Research Agent",
            "model": "gpt-4o",
            "system_prompt": "You are a helpful research assistant with web search capabilities.",
            "temperature": 0.7,
            "tool_ids": [tool_id]
        }
        response = requests.post(f"{BASE_URL}/api/v1/agents", json=payload, headers=headers)
        if response.status_code == 201:
            agent = response.json()
            log_test("Create Agent", "PASS", f"Agent ID: {agent['id']}", agent)
            return agent["id"]
        else:
            log_test("Create Agent", "FAIL", f"Status: {response.status_code}", response.json())
            return None
    except Exception as e:
        log_test("Create Agent", "FAIL", str(e))
        return None

def test_create_conversation(token: str, agent_id: int) -> int:
    """Test creating conversation (NEW FEATURE)"""
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "agent_id": agent_id,
            "title": "Test Research Session"
        }
        response = requests.post(f"{BASE_URL}/api/v1/conversations", json=payload, headers=headers)
        if response.status_code == 201:
            conversation = response.json()
            log_test("Create Conversation", "PASS", f"Conversation ID: {conversation['id']}", conversation)
            return conversation["id"]
        else:
            log_test("Create Conversation", "FAIL", f"Status: {response.status_code}", response.json())
            return None
    except Exception as e:
        log_test("Create Conversation", "FAIL", str(e))
        return None

def test_upload_text_document(token: str, agent_id: int) -> int:
    """Test uploading text document"""
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "agent_id": agent_id,
            "filename": "gpt4o_info.txt",
            "content": "GPT-4o is OpenAI's flagship model. Key features: multimodal, 128K context, faster than GPT-4.",
            "metadata": {"source": "test", "topic": "AI"}
        }
        response = requests.post(f"{BASE_URL}/api/v1/documents", json=payload, headers=headers)
        if response.status_code in [200, 201]:
            doc = response.json()
            log_test("Upload Text Document", "PASS", f"Document ID: {doc['id']}", doc)
            return doc["id"]
        else:
            log_test("Upload Text Document", "FAIL", f"Status: {response.status_code}", response.json())
            return None
    except Exception as e:
        log_test("Upload Text Document", "FAIL", str(e))
        return None

def test_upload_youtube(token: str, agent_id: int) -> int:
    """Test YouTube transcript extraction (NEW FEATURE)"""
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "agent_id": agent_id,
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "include_timestamps": True
        }
        response = requests.post(f"{BASE_URL}/api/v1/documents/youtube", json=payload, headers=headers)
        if response.status_code in [200, 201]:
            doc = response.json()
            video_id = doc.get('metadata', {}).get('video_id', 'N/A') if isinstance(doc.get('metadata'), dict) else 'N/A'
            log_test("Upload YouTube Transcript", "PASS", f"Document ID: {doc['id']}, Video: {video_id}", doc)
            return doc["id"]
        else:
            log_test("Upload YouTube Transcript", "FAIL", f"Status: {response.status_code}", response.json())
            return None
    except Exception as e:
        log_test("Upload YouTube Transcript", "FAIL", str(e))
        return None

def test_create_run_simple(token: str, agent_id: int) -> int:
    """Test creating simple run"""
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "agent_id": agent_id,
            "input_text": "What is GPT-4o?"
        }
        response = requests.post(f"{BASE_URL}/api/v1/runs", json=payload, headers=headers)
        if response.status_code in [200, 201]:
            run = response.json()
            log_test("Create Run (Simple)", "PASS", f"Run ID: {run['id']}, Status: {run['status']}", run)
            return run["id"]
        else:
            log_test("Create Run (Simple)", "FAIL", f"Status: {response.status_code}", response.json())
            return None
    except Exception as e:
        log_test("Create Run (Simple)", "FAIL", str(e))
        return None

def test_create_run_with_conversation(token: str, agent_id: int, conversation_id: int) -> int:
    """Test creating run with conversation (NEW FEATURE - Agent Memory)"""
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "agent_id": agent_id,
            "input_text": "Tell me about GPT-4o's key features",
            "conversation_id": conversation_id
        }
        response = requests.post(f"{BASE_URL}/api/v1/runs", json=payload, headers=headers)
        if response.status_code in [200, 201]:
            run = response.json()
            conv_id = run.get('conversation_id', conversation_id)
            log_test("Create Run (With Conversation)", "PASS", f"Run ID: {run['id']}, Conversation: {conv_id}", run)
            return run["id"]
        else:
            log_test("Create Run (With Conversation)", "FAIL", f"Status: {response.status_code}", response.json())
            return None
    except Exception as e:
        log_test("Create Run (With Conversation)", "FAIL", str(e))
        return None

def test_create_run_with_web_search(token: str, agent_id: int, conversation_id: int) -> int:
    """Test creating run with web search (NEW FEATURE)"""
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {
            "agent_id": agent_id,
            "input_text": "Search the web: What are the latest AI developments in December 2025?",
            "conversation_id": conversation_id
        }
        response = requests.post(f"{BASE_URL}/api/v1/runs", json=payload, headers=headers)
        if response.status_code in [200, 201]:
            run = response.json()
            log_test("Create Run (Web Search)", "PASS", f"Run ID: {run['id']}", run)
            return run["id"]
        else:
            log_test("Create Run (Web Search)", "FAIL", f"Status: {response.status_code}", response.json())
            return None
    except Exception as e:
        log_test("Create Run (Web Search)", "FAIL", str(e))
        return None

def test_get_conversation(token: str, conversation_id: int):
    """Test getting conversation with messages (NEW FEATURE - Agent Memory)"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/conversations/{conversation_id}", headers=headers)
        if response.status_code == 200:
            conversation = response.json()
            message_count = len(conversation.get("messages", []))
            log_test("Get Conversation with Messages", "PASS", f"Found {message_count} messages", conversation)
            return True
        else:
            log_test("Get Conversation with Messages", "FAIL", f"Status: {response.status_code}", response.json())
            return False
    except Exception as e:
        log_test("Get Conversation with Messages", "FAIL", str(e))
        return False

def test_list_documents(token: str, agent_id: int):
    """Test listing documents"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/documents?agent_id={agent_id}", headers=headers)
        if response.status_code == 200:
            docs = response.json()
            log_test("List Documents", "PASS", f"Found {len(docs)} documents", {"count": len(docs)})
            return True
        else:
            log_test("List Documents", "FAIL", f"Status: {response.status_code}", response.json())
            return False
    except Exception as e:
        log_test("List Documents", "FAIL", str(e))
        return False

def test_get_run_steps(token: str, run_id: int):
    """Test getting run steps (to check tool usage)"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/v1/runs/{run_id}/steps", headers=headers)
        if response.status_code == 200:
            steps = response.json()
            log_test("Get Run Steps", "PASS", f"Found {len(steps)} steps", {"count": len(steps)})
            return True
        else:
            log_test("Get Run Steps", "FAIL", f"Status: {response.status_code}", response.json())
            return False
    except Exception as e:
        log_test("Get Run Steps", "FAIL", str(e))
        return False

def test_update_conversation(token: str, conversation_id: int):
    """Test updating conversation title"""
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        payload = {"title": "Updated Research Session"}
        response = requests.patch(f"{BASE_URL}/api/v1/conversations/{conversation_id}", json=payload, headers=headers)
        if response.status_code == 200:
            conversation = response.json()
            log_test("Update Conversation", "PASS", f"Title updated to: {conversation['title']}", conversation)
            return True
        else:
            log_test("Update Conversation", "FAIL", f"Status: {response.status_code}", response.json())
            return False
    except Exception as e:
        log_test("Update Conversation", "FAIL", str(e))
        return False

def run_all_tests():
    """Run all tests in sequence"""
    print("=" * 60)
    print("AgentOps Hub - Complete API Testing")
    print("=" * 60)
    print()
    
    # 1. Health Check
    print("🏥 Testing Health Check...")
    if not test_health_check():
        print("❌ Health check failed. Server may not be running.")
        return
    print()
    
    # 2. Register User
    print("👤 Testing Authentication...")
    test_register_user()
    
    # 3. Login
    token = test_login()
    if not token:
        print("❌ Login failed. Cannot proceed with authenticated tests.")
        return
    print()
    
    # 4. List Tools
    print("🛠️ Testing Tools...")
    tool_id = test_list_tools(token)
    if not tool_id:
        print("⚠️ web_search tool not found. Web search tests will fail.")
    print()
    
    # 5. Create Agent
    print("🤖 Testing Agents...")
    agent_id = test_create_agent(token, tool_id)
    if not agent_id:
        print("❌ Agent creation failed. Cannot proceed with agent-dependent tests.")
        return
    print()
    
    # 6. Create Conversation (NEW)
    print("🧠 Testing Conversations (NEW FEATURE)...")
    conversation_id = test_create_conversation(token, agent_id)
    print()
    
    # 7. Upload Documents
    print("📄 Testing Documents...")
    test_upload_text_document(token, agent_id)
    test_upload_youtube(token, agent_id)
    test_list_documents(token, agent_id)
    print()
    
    # 8. Create Runs
    print("▶️ Testing Runs...")
    run_id_simple = test_create_run_simple(token, agent_id)
    
    if conversation_id:
        run_id_conv = test_create_run_with_conversation(token, agent_id, conversation_id)
        time.sleep(2)  # Give runs time to process
        run_id_search = test_create_run_with_web_search(token, agent_id, conversation_id)
    print()
    
    # 9. Get Conversation with Messages (NEW)
    if conversation_id:
        print("💬 Testing Conversation Memory (NEW FEATURE)...")
        test_get_conversation(token, conversation_id)
        test_update_conversation(token, conversation_id)
        print()
    
    # Summary
    print()
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📊 Total: {results['passed'] + results['failed']}")
    print(f"📈 Success Rate: {(results['passed'] / (results['passed'] + results['failed']) * 100):.1f}%")
    print("=" * 60)
    
    return results

if __name__ == "__main__":
    results = run_all_tests()
    
    # Save results to JSON
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print("\n✅ Results saved to test_results.json")
