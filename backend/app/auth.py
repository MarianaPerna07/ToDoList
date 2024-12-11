import time
import os
from jose import JWTError, jwk, jwt
from jose.utils import base64url_decode
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict
import requests

from app import crud, schemas
from app.database import get_db
from sqlalchemy.orm import Session

# Load Cognito variables from environment
cognito_region = os.getenv('AWS_REGION')
user_pool_id = os.getenv('COGNITO_USERPOOL_ID')
app_client_id = os.getenv('COGNITO_APP_CLIENT_ID')

# URL to get Cognito public keys
keys_url = f'https://cognito-idp.{cognito_region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'
jwks = requests.get(keys_url).json()

reusable_oauth2 = HTTPBearer(scheme_name='Authorization')

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(reusable_oauth2), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        # Get the kid from token headers
        headers = jwt.get_unverified_header(token)
        kid = headers['kid']

        # Search for the kid in the downloaded public keys
        key_index = -1
        for i in range(len(jwks['keys'])):
            if kid == jwks['keys'][i]['kid']:
                key_index = i
                break
        if key_index == -1:
            raise HTTPException(status_code=401, detail="Public key not found in jwks.json")

        # Construct the public key
        public_key = jwk.construct(jwks['keys'][key_index])

        # Get the message and signature from token
        message, encoded_signature = token.rsplit('.', 1)
        decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))

        # Verify the signature
        if not public_key.verify(message.encode("utf8"), decoded_signature):
            raise HTTPException(status_code=401, detail="Signature verification failed")

        # Since we passed the verification, we can now safely decode the token
        claims = jwt.get_unverified_claims(token)
        # Verify token expiration
        if claims['exp'] < time.time():
            raise HTTPException(status_code=401, detail="Token is expired")
        # Verify audience (if necessary)
        if claims['aud'] != app_client_id:
            raise HTTPException(status_code=401, detail="Token was not issued for this audience")

        # At this point, token is valid
        cognito_id = claims['sub']
        email = claims.get('email')
        given_name = claims.get('given_name')
        family_name = claims.get('family_name')

        # Check if user exists in DB, if not create one
        user = crud.get_user_by_cognito_id(db, cognito_id)
        if not user:
            user_in = schemas.UserCreate(
                cognito_id=cognito_id,
                given_name=given_name,
                family_name=family_name,
                email=email
            )
            user = crud.create_user(db, user_in)
        return user

    except JWTError as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials") from e
