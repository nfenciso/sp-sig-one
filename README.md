# How to locally run Sig One (by Nathaniel F. Enciso)
## WITH Docker and Docker Compose

If you have Docker and Docker Compose installed, follow the steps for this section:
1. Open the command prompt (cmd) and set directory to the root of the project (at the same level as this README.md or the subfolders 'frontend' and 'backend')
2. Create an .env file here and fill out the details. Like so:
    ```
    MONGODB_URI=my_own_mongodb_uri
    CLIENT_ID=my_own_client_id
    REACT_APP_CLIENT_ID=my_own_client_id
    ```  
3. Replace my_own_mongodb_uri with the connection string of the database (MongoDB) you want to use. And replace my_own_client_id with your own Google OAuth client ID. Refer to this webpage: https://clerk.com/blog/oauth2-react-user-authorization. Else, you may contact the developer at nfenciso@up.edu.ph to request for their details  
4. Run 'docker compose build', then run 'docker compose up'
5. To stop the frontend and/or the backend, do CTRL+c in the command prompt. Then run 'docker compose down'

## WITHOUT Docker and Docker Compose

First make sure that Node.js (preferably version 14) is installed.

Follow the listed steps:
1. Open the command prompt (cmd) and set directory to the backend folder
2. Create an .env file in the backend folder and fill out the details with the relevant environment variables MONGODB_URI and CLIENT_ID. Like so:
    ```
    MONGODB_URI=my_own_mongodb_uri
    CLIENT_ID=my_own_client_id
    ```  
3. Replace my_own_mongodb_uri with the connection string of the database (MongoDB) you want to use. And replace my_own_client_id with your own Google OAuth client ID. Refer to this webpage: https://clerk.com/blog/oauth2-react-user-authorization. Else, you may contact the developer at nfenciso@up.edu.ph to request for their details  
4. For the first time, run 'npm i' to install the libraries in the backend folder  
5. Then, run 'npm start' 
6. Open another window of the command prompt and set directory to the frontend folder
7. Create an .env file in the frontend folder and fill out the details with the relevant environment variable REACT_APP_CLIENT_ID. Like so:
    ```
    REACT_APP_CLIENT_ID=my_own_client_id
    ```  
8. Replace my_own_client_id with your own Google OAuth client ID. This should be the same as the value used in the earlier backend .env file.
9. For the first time (in this subfolder), run 'npm i' to install the libraries in the frontend folder
10. Then, run 'npm start'
11. To stop the frontend and/or the backend, do CTRL+c in the command prompts.