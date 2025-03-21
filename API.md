## API - Get through a GET / POST Request

### GET:

`https://medal-dl.rxx.fi/api/clip?url=<Url of Medal Clip>`  
`https://medal-dl.rxx.fi/api/clip?id=<ID of Medal Clip>`

### POST

```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"<your-clip-url>"}' \
  https://medal-dl.rxx.fi/api/clip
```

##### `'{"url":"<your-url>"}'` can be replaced with `'{"id":"<your-clip-id>"}'`

### RESPONSE (JSON)

```json
{
  "valid": true/false,
  "src": "<MEDAL CLIP MP4 URL>"   *IF VALID
  "reasoning": "<REASON FOR ERROR>"   *IF INVALID
}
```

###### By Tyson3101
