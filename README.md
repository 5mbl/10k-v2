## **Start FastAPI Server** 

### Development:
Repo: https://github.com/5mbl/10k-v2-API

Run locally:
```bash
cd backend  
source venv/bin/activate  
uvicorn main:app --host 0.0.0.0 --port 8000 --reload  
```

### Production

- **API Base URL:**  
  [https://one0k-v2-api.onrender.com](https://one0k-v2-api.onrender.com)

- **Render.com Dashboard:**  
  [View Deployment](https://dashboard.render.com/web/srv-d21bb0qdbo4c73dvr5f0/deploys/dep-d21bvo7fte5s73fee1dg)

**Test the root endpoint:**

```http
GET https://one0k-v2-api.onrender.com
```

Expected Response:
{
  "message": "Welcome to the SEC-RAG-API"
}



## **Start Frontend**  
```bash
cd frontend  
npm run dev    
```   


![image](https://github.com/user-attachments/assets/d0f3b0eb-1512-40ba-b7fb-c8ebf643937f)
