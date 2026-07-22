from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ZENDA Analytics", version="4.8.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión a PostgreSQL
def get_db():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        user="zenda_admin",
        password="zenda_secure_pass_2026",
        database="zenda"
    )

@app.get("/health")
async def health_check():
    return {"status": "OK", "service": "modulo_5_analitica"}

@app.get("/api/v1/analytics/metrics")
async def get_metrics():
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("SELECT COUNT(*) as total FROM tenant_default.vehicles")
        vehicles = cur.fetchone()
        
        cur.execute("SELECT COUNT(*) as total FROM tenant_default.drivers")
        drivers = cur.fetchone()
        
        cur.execute("SELECT COUNT(*) as total FROM tenant_default.routes")
        routes = cur.fetchone()
        
        cur.execute("SELECT COUNT(*) as total FROM tenant_default.users")
        users = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "vehicles": vehicles["total"] if vehicles else 0,
                "drivers": drivers["total"] if drivers else 0,
                "routes": routes["total"] if routes else 0,
                "users": users["total"] if users else 0,
                "timestamp": "2026-07-22T16:50:00Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/analytics/dashboard")
async def get_dashboard():
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cur.execute("""
            SELECT 
                (SELECT COUNT(*) FROM tenant_default.vehicles) as total_vehicles,
                (SELECT COUNT(*) FROM tenant_default.drivers) as total_drivers,
                (SELECT COUNT(*) FROM tenant_default.routes) as total_routes,
                (SELECT COUNT(*) FROM tenant_default.users) as total_users
        """)
        totals = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "vehicles": totals["total_vehicles"] if totals else 0,
                "drivers": totals["total_drivers"] if totals else 0,
                "routes": totals["total_routes"] if totals else 0,
                "users": totals["total_users"] if totals else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8086)
