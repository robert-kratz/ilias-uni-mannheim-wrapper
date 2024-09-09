# Application Alerts Schema

The schema for the application alerts. Types of alerts are `info`, `warning`, and `error`.

```json
{
    "alerts": [
        {
            "title": "Success Blue Alert",
            "description": "Alert Description",
            "type": "info",
            "active": true
        },
        {
            "title": "Error Yellow Alert",
            "description": "Alert Description",
            "type": "warning",
            "active": true
        },
        {
            "title": "Error Red Alert",
            "description": "Alert Description",
            "type": "error",
            "active": true
        }
    ]
}
```

Edit this page on GitHub
