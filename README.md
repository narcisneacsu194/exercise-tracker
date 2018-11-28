# Exercise Tracker

Microservice project for tracking details about exercises done by different users.

**Examples:**

* *POST /api/exercise/new-user* enables you to create a new user. A request body like the following is needed: 

   ```
    {
      "username": "exampleUsername"
    }
   ```
 After this endpoint is executed, a response body like the following is returned: 
   ```
    {
      "username": "exampleUsername",
      "_id": "<random_alphanumeric_string>"
    }
   ```
 The "_id" property is needed to access the exercises done by that specific user.

* *POST /api/exercise/add* enables you to create an exercise for a specific user. A request body like the following is needed: 

   ```
    {
      "userId": "<random_alphanumeric_string_of_user>",
      "description": "Example exercise description",
      "duration": 10
      "date": 2018-11-28
    }
   ```
 The "duration" property is how much time did it took the user to do the exercise (in minutes).
 The "date" property needs to have a format like *yyy-mm-dd*.

  The "userId", "description" and "duration" properties are **mandatory**.

  After this endpoint is executed, a response body like the following is returned: 
   ```
    {
      "username": "exampleUsername",
      "description": "Example description",
      "duration": 10,
      "_id": "<random_alphanumeric_string_of_user>",
      "date": "Wed Nov 28 2018"
    }
   ```
 As you can see, the "date" property is returned using a different format. This property will be used in the *GET /api/exercise/log?{userId}[&from][&to][&limit]* endpoint, so you can get all the exercises done by a specific user, in a given interval of time.

* *GET /api/exercise/log?{userId}[&from][&to][&limit]* enables you to get all or some of the exercises done by a specific user.
The "userId" request param is **mandatory**, while the "from", "to" and "limit" properties are *optional*.

  The "from" and "to" are properties which contain dates with a format like *yyyy-mm-dd*. These two properties are used to specify from what interval of time you want to retrieve the specific user's exercises.

 The "limit" property is used to specify the number of exercises to 
 be returned from the query.

 When you execute this *GET* endpoint, a response like the following will be retrieved:

   ```
    {
      "description": "Example description",
      "duration": 10,
      "date": "Wed Nov 28 2018"
    }
   ```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

You need to have ***git***, ***yarn***, ***nodejs*** and ***mongodb*** installed on your computer.

### Installation steps

```
> git clone git@github.com:narcisneacsu194/exercise-tracker.git
> cd {your_local_path}/exercise-tracker
> yarn install
> cd {your_local_path}/mongodb/bin
> ./mongod --dbpath {path_of_mongo_data_folder}
> node server.js
```

You can then access the application with any browser or with software like Postman, using the following URL:

```
localhost:3000
```
