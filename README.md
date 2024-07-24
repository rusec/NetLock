# NetLock

First time set up.

```sh
npm install
```

The app requires an SSL cert to ensure encrypted communication to create an SSL cert use the following command
Make sure to make the passphrase **pine**

```sh
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365
```

Make sure the following packages are installed npm might not install them right away

-   nodemon
-   webpack

To start the app in dev mode.

```sh
npm run start:dev
```

if on Windows run the following in a different CLI

```sh
webpack -w
```

Creating a target entry

Send a post request to /api/beacon/register with the following, a token will be returned.

Authorization: "MindoverMatter"

```http


{
    "active": true,
    "interfaces": [
        {
            "ip": "192.168.1.1",
            "state": "up",
            "mac": "e3:23:2d:fg:vt:3d"
        }
    ], // fill with your data
    "hostname": "testing6", // fill with your data
    "apps": [{
        "name":"firefox",
        "version": "there was a version somewhere"
    }], // fill with your data
    "os": "tesing os", // fill with your data
    "users": [{
        "name": "root"
    }] // fill with your data
}
```

Afterwards go to localhost/register to create a password and then login.
