---
title: FastAPI —如何添加基本和Cookie身份验证
subtitle: 文章暂存
author: systemime
date: 2020-03-16
header_img: /img/in-post/2020-10-29/header.jpg
catalog: true
tags:
  - python
---

欢迎来到我的世界.

<!-- more -->


<br />**Background**<br />In my work as a Data Rebel, I encounter many challenges to help unlock, enrich and use data to help our customers. In the last couple of years, I have come to the conclusion that at this moment in time, the best way to scale and provide data-driven solutions is by creating API’s. These API’s can be used and consumed by your own API’s our by other consumers like for example a customer-faced website.<br />As our team makes use of Python in almost all cases, finding the right library can significantly speed up the development process. At this moment we use the[Hug](http://www.hug.rest/)library a lot which has served us greatly, but I think it is important to keep an open mind and see what projects are started, evolve and become more mainstream.<br />
<br />**Enter FastAPI**<br />A couple of months ago I accidentally stumbled upon FastAPI. At first glance, I thought: “Hé this looks really interesting: solid documentation and a solid foundation ([Starlette](https://www.starlette.io/)) ”, but I didn’t have the time to play around with it.<br />As time progressed, I felt that I had to try out FastAPI and I am really glad I did this! The ease of use, the documentation, the already great community and frequent updates, make it a joy to work with.[Sebastián Ramírez](https://github.com/tiangolo), the founder of this project is, is a great guy who spends a lot of time answering questions and thinking about challenges the users of the library face. As he is patient, helpful and supportive, he has created an informal culture of how we as a community should approach one-another and help each other out.<br />**So what is our challenge?**<br />As the solutions we as Data Rebels create have to be secure, we almost always make use of external authentications systems like[Okta](https://www.okta.com/)and[Auth0](https://auth0.com/). These systems take out the burden of having to create our own secure identity solution. Besides this, during development, we want to be able to login to the API directly to validate, debug and test it. Furthermore, we don’t want to share the Swagger documentation with the outside world, so these endpoints should be behind an authentication layer.<br />With the help of Sebastián I came up with the following approach:

1. Login on the API by making use of Basic Authentication
1. Receive a token in the form of a cookie
1. When logging in to an endpoint, validate headers or the cookie containing a token
1. Return the content

**How to support this?**<br />I started out with this base structure from the great FastAPI tutorial, which can be found here:[https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)<br />With this, the basic set-up is in place. The missing pieces are:

1. Create a custom class which makes use of Basic Authentication
1. Creating an endpoint to trigger Basic Authentication and return a cookie with an authentication header
1. Create an extended class to check for an Authorization header or Cookie header
1. Create a logout function to clear the cookie
1. Create custom endpoints for the documentation which should be secure endpoints

To make the example as simple as possible, I have kept the tutorial code intact as possible. The complete gist is the last one in this article, so you can scroll down if you want to skip the steps. We first start with the needed imports:<br />

```python
from typing import Optional
import base64
from passlib.context import CryptContext
from datetime import datetime, timedelta

import jwt
from jwt import PyJWTError

from pydantic import BaseModel

from fastapi import Depends, FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordRequestForm, OAuth2
from fastapi.security.base import SecurityBase
from fastapi.security.utils import get_authorization_scheme_param
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.openapi.utils import get_openapi

from starlette.status import HTTP_403_FORBIDDEN
from starlette.responses import RedirectResponse, Response, JSONResponse
from starlette.requests import Request
```
There are some extra imports needed, like for example the Starlette responses and requests.<br />The following gist shows the neede Basic Authentication class:
```python
class BasicAuth(SecurityBase):
    def __init__(self, scheme_name: str = None, auto_error: bool = True):
        self.scheme_name = scheme_name or self.__class__.__name__
        self.auto_error = auto_error

    async def __call__(self, request: Request) -> Optional[str]:
        authorization: str = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "basic":
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_403_FORBIDDEN, detail="Not authenticated"
                )
            else:
                return None
        return param


basic_auth = BasicAuth(auto_error=False)
```
This class follows the pattern of the OAuth2PasswordBearer class. As can be seen, the scheme that is being checked is the basic scheme. The last line shows the creation of an object with the newly added auto_error keyword argument.<br />The next gist contains the creation of the endpoint:
```python
@app.get("/login_basic")
async def login_basic(auth: BasicAuth = Depends(basic_auth)):
    if not auth:
        response = Response(headers={"WWW-Authenticate": "Basic"}, status_code=401)
        return response

    try:
        decoded = base64.b64decode(auth).decode("ascii")
        username, _, password = decoded.partition(":")
        user = authenticate_user(fake_users_db, username, password)
        if not user:
            raise HTTPException(status_code=400, detail="Incorrect email or password")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username}, expires_delta=access_token_expires
        )

        token = jsonable_encoder(access_token)

        response = RedirectResponse(url="/docs")
        response.set_cookie(
            "Authorization",
            value=f"Bearer {token}",
            domain="localtest.me",
            httponly=True,
            max_age=1800,
            expires=1800,
        )
        return response

    except:
        response = Response(headers={"WWW-Authenticate": "Basic"}, status_code=401)
        return response
```
Basically, this endpoint triggers the Basic Authentication window in your browser and returns a cookie containing the Authorization Bearer token to be used in future requests. The settings for the cookie, like domain, max_age and expires are from the Starlette library which can be found[here](https://www.starlette.io/responses/). This endpoint keeps triggering a Basic Authentication window until valid credentials are filled in.<br />For this set-up to work, check that you have a**valid domain**, otherwise the**cookie will not be set**(this is what I ran into). For this example, I chose localtest.me which redirects you to your localhost /127.0.0.1.<br />Now for the new and extended OAuth2PasswordBearer class:
```python
class OAuth2PasswordBearerCookie(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: str = None,
        scopes: dict = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        header_authorization: str = request.headers.get("Authorization")
        cookie_authorization: str = request.cookies.get("Authorization")

        header_scheme, header_param = get_authorization_scheme_param(
            header_authorization
        )
        cookie_scheme, cookie_param = get_authorization_scheme_param(
            cookie_authorization
        )

        if header_scheme.lower() == "bearer":
            authorization = True
            scheme = header_scheme
            param = header_param

        elif cookie_scheme.lower() == "bearer":
            authorization = True
            scheme = cookie_scheme
            param = cookie_param

        else:
            authorization = False

        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_403_FORBIDDEN, detail="Not authenticated"
                )
            else:
                return None
        return param

oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl="/token")
```
As mentioned, this class is an extension of the OAuth2PasswordBearer class which now includes checking for an Authorization header and an Authorization cookie. This will use a header as preference and falls back to a cookie. I could imagine that for override/testing purposes using a header is more flexible than a cookie as this can be set in Postman for example. Furthermore, you have to create this object and use this instead of the OAuth2PasswordBearer class.<br />As it should be easy to clear the cookie and login with another username/password, we need a logout endpoint:
```python

@app.get("/logout")
async def route_logout_and_remove_cookie():
    response = RedirectResponse(url="/")
    response.delete_cookie("Authorization", domain="localtest.me")
    return response
```
Now for the final steps to be able to this are:
```python

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

@app.get("/")
async def homepage():
    return "Welcome to the security test!"
    
@app.get("/openapi.json")
async def get_open_api_endpoint(current_user: User = Depends(get_current_active_user)):
    return JSONResponse(get_openapi(title="FastAPI", version=1, routes=app.routes))


@app.get("/docs")
async def get_documentation(current_user: User = Depends(get_current_active_user)):
    return get_swagger_ui_html(openapi_url="/openapi.json", title="docs")
```
With the first line, I disable the automatic creation of the documentation/swagger endpoint, this to be able to test that we cannot access documentation without being logged in. The “/openapi.json” is needed to create the swagger documentation, so I create it manually with security in place. The same goes for the “/docs” endpoint.<br />**Now start-up FastAPI and test if it works!**<br />Go to http://localtest.me:8000:

Go to http://localtest.me:8000/login_basic:

Username: johndoe Password: secret<br />Login and see the documentation:

And now access the http://localtest.me:8000/users/me endpoint:

Now http://localtest.me:8000/openapi.json:

Now trigger the logout action, http://localtest.me:8000/logout:

Redirect to the root<br />Check if you can access http://localtest.me:8000/docs and http://localtest.me:8000/openapi:

Unable to see the docs or openapi.json due to access restrictions<br />Great, it all works!<br />**Final words**<br />Hopefully, this post will help people who want to implement Basic Authentication in FastAPI. Many thanks go out to[Sebastián Ramírez](https://github.com/tiangolo)and the helpful FastAPI community, in particular,[William Hayes](https://github.com/wshayes)who convinced me to create an article on this topic.<br />Happy Fast-API’ing!<br />

```python
from typing import Optional
import base64
from passlib.context import CryptContext
from datetime import datetime, timedelta

import jwt
from jwt import PyJWTError

from pydantic import BaseModel

from fastapi import Depends, FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.security import OAuth2PasswordRequestForm, OAuth2
from fastapi.security.base import SecurityBase
from fastapi.security.utils import get_authorization_scheme_param
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.openapi.utils import get_openapi

from starlette.status import HTTP_403_FORBIDDEN
from starlette.responses import RedirectResponse, Response, JSONResponse
from starlette.requests import Request


# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    }
}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str = None


class User(BaseModel):
    username: str
    email: str = None
    full_name: str = None
    disabled: bool = None


class UserInDB(User):
    hashed_password: str


class OAuth2PasswordBearerCookie(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: str = None,
        scopes: dict = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        header_authorization: str = request.headers.get("Authorization")
        cookie_authorization: str = request.cookies.get("Authorization")

        header_scheme, header_param = get_authorization_scheme_param(
            header_authorization
        )
        cookie_scheme, cookie_param = get_authorization_scheme_param(
            cookie_authorization
        )

        if header_scheme.lower() == "bearer":
            authorization = True
            scheme = header_scheme
            param = header_param

        elif cookie_scheme.lower() == "bearer":
            authorization = True
            scheme = cookie_scheme
            param = cookie_param

        else:
            authorization = False

        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_403_FORBIDDEN, detail="Not authenticated"
                )
            else:
                return None
        return param


class BasicAuth(SecurityBase):
    def __init__(self, scheme_name: str = None, auto_error: bool = True):
        self.scheme_name = scheme_name or self.__class__.__name__
        self.auto_error = auto_error

    async def __call__(self, request: Request) -> Optional[str]:
        authorization: str = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "basic":
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_403_FORBIDDEN, detail="Not authenticated"
                )
            else:
                return None
        return param


basic_auth = BasicAuth(auto_error=False)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl="/token")

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=HTTP_403_FORBIDDEN, detail="Could not validate credentials"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except PyJWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@app.get("/")
async def homepage():
    return "Welcome to the security test!"


@app.post("/token", response_model=Token)
async def route_login_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/logout")
async def route_logout_and_remove_cookie():
    response = RedirectResponse(url="/")
    response.delete_cookie("Authorization", domain="localtest.me")
    return response


@app.get("/login_basic")
async def login_basic(auth: BasicAuth = Depends(basic_auth)):
    if not auth:
        response = Response(headers={"WWW-Authenticate": "Basic"}, status_code=401)
        return response

    try:
        decoded = base64.b64decode(auth).decode("ascii")
        username, _, password = decoded.partition(":")
        user = authenticate_user(fake_users_db, username, password)
        if not user:
            raise HTTPException(status_code=400, detail="Incorrect email or password")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username}, expires_delta=access_token_expires
        )

        token = jsonable_encoder(access_token)

        response = RedirectResponse(url="/docs")
        response.set_cookie(
            "Authorization",
            value=f"Bearer {token}",
            domain="localtest.me",
            httponly=True,
            max_age=1800,
            expires=1800,
        )
        return response

    except:
        response = Response(headers={"WWW-Authenticate": "Basic"}, status_code=401)
        return response


@app.get("/openapi.json")
async def get_open_api_endpoint(current_user: User = Depends(get_current_active_user)):
    return JSONResponse(get_openapi(title="FastAPI", version=1, routes=app.routes))


@app.get("/docs")
async def get_documentation(current_user: User = Depends(get_current_active_user)):
    return get_swagger_ui_html(openapi_url="/openapi.json", title="docs")


@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@app.get("/users/me/items/")
async def read_own_items(current_user: User = Depends(get_current_active_user)):
    return [{"item_id": "Foo", "owner": current_user.username}]
```
