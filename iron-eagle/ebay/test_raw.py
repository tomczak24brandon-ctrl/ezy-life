import sys, requests
sys.stdout.reconfigure(encoding='utf-8')

url = "https://api.ebay.com/ws/api.dll"
headers = {
    "X-EBAY-API-SITEID": "0",
    "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
    "X-EBAY-API-CALL-NAME": "GeteBayOfficialTime",
    "X-EBAY-API-APP-NAME": "IronEagl-IronEagl-PRD-80acd91f7-5a18cebc",
    "X-EBAY-API-DEV-NAME": "7867a684-3bd5-4648-a60d-565f79425dcb",
    "X-EBAY-API-CERT-NAME": "PRD-0acd91f76bcf-3462-4a26-a5c6-3dff",
    "Content-Type": "text/xml",
}
token = "v^1.1#i^1#f^0#r^1#p^3#I^3#t^Ul4xMF85OkI2NUM4OEFERDFCMUY0MzkwRDY0MTcwMDI1QTYyRjE4XzJfMSNFXjI2MA=="
body = (
    '<?xml version="1.0" encoding="utf-8"?>'
    '<GeteBayOfficialTimeRequest xmlns="urn:ebay:apis:eBLBaseComponents">'
    "<RequesterCredentials>"
    f"<eBayAuthToken>{token}</eBayAuthToken>"
    "</RequesterCredentials>"
    "</GeteBayOfficialTimeRequest>"
)

r = requests.post(url, headers=headers, data=body.encode("utf-8"), timeout=15)
print(f"Status: {r.status_code}")
print(f"Response:\n{r.text[:1000]}")
