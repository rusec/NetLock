# NetLock

What is NetLock,
NetLock is a siem/command control server that is meant to be deployed quickly and without a lot of work from the end user. The goal is to create a C2 server that gives the blue team key insights into the landscape by documenting events happening around the network. It does this by using beacons which give event updates to the server using HTTPS. The server also hosts a web

First time set up.

```sh
npm install & npm install ./lib
```

The app requires an SSL cert to ensure encrypted communication to create an SSL cert use the following command
Make sure to make the passphrase **pine**

```sh
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes -subj "/CN=localhost" -passout pine
```

To build the app in dev mode

```sh
npm run build:dev
```

To start the app in dev mode.

```sh
npm run start:dev -- --passphrase=pine
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

Afterwards go to https://localhost/register to create a password and then login.
