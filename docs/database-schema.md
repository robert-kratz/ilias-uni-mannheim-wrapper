# Database Schema

The following tables represent the database schema for the application. The application uses SQLite as the database engine. The schema is subject to change as development progresses and requirements change.

### User

Represents the users of the application.

| Column    | Type | Description                             |
| --------- | ---- | --------------------------------------- |
| id        | TEXT | The primary key, UUID v4.               |
| email     | TEXT | Unique email address of the user.       |
| createdAt | DATE | Date the user was created.              |
| lastAuth  | DATE | Date of the user's last authentication. |

### Event Logger

Logs various events occurring within the application.

| Column | Type | Description                                                 |
| ------ | ---- | ----------------------------------------------------------- |
| id     | TEXT | The primary key, UUID v4.                                   |
| iat    | DATE | The date and time of the event.                             |
| type   | TEXT | The type of event.                                          |
| value  | TEXT | A JSON string representing additional data about the event. |

### Groups

Group information for users.

| Column      | Type | Description                                               |
| ----------- | ---- | --------------------------------------------------------- |
| id          | TEXT | The primary key, UUID v4.                                 |
| title       | TEXT | Title of the group.                                       |
| description | TEXT | Description of the group.                                 |
| year        | TEXT | Year of the group, nullable.                              |
| userid      | TEXT | Foreign key referencing User.                             |
| parentId    | TEXT | Foreign key referencing Course.                           |
| createdAt   | DATE | Date the group was created. Defaults to the current date. |
| updatedAt   | DATE | Date the group was last updated. Defaults to null.        |

### Courses

Courses that users might be taking or teaching.

| Column      | Type | Description                                                |
| ----------- | ---- | ---------------------------------------------------------- |
| id          | TEXT | The primary key, UUID v4.                                  |
| title       | TEXT | Title of the course.                                       |
| description | TEXT | Description of the course.                                 |
| year        | TEXT | Academic year of the course.                               |
| userid      | TEXT | Foreign key referencing User.                              |
| createdAt   | DATE | Date the course was created. Defaults to the current date. |
| updatedAt   | DATE | Date the course was last updated. Defaults to null.        |

### Directories

Directories for organizing course materials.

| Column      | Type | Description                                                   |
| ----------- | ---- | ------------------------------------------------------------- |
| id          | TEXT | The primary key, UUID v4.                                     |
| name        | TEXT | Name of the directory.                                        |
| description | TEXT | Description of the directory.                                 |
| parentId    | TEXT | Foreign key referencing Course.                               |
| userid      | TEXT | Foreign key referencing User.                                 |
| createdAt   | DATE | Date the directory was created. Defaults to the current date. |
| updatedAt   | DATE | Date the directory was last updated. Defaults to null.        |

### Files

Files stored in directories or associated with courses.

| Column    | Type | Description                                              |
| --------- | ---- | -------------------------------------------------------- |
| id        | TEXT | The primary key, UUID v4.                                |
| name      | TEXT | Name of the file.                                        |
| parentId  | TEXT | Foreign key referencing Directory or Course.             |
| userid    | TEXT | Foreign key referencing User.                            |
| createdAt | DATE | Date the file was created. Defaults to the current date. |
| updatedAt | DATE | Date the file was last updated. Defaults to null.        |

## Relationships

- `groups.userid`, `courses.userid`, `directories.userid`, and `files.userid` all reference `user.id`.
- `directories.parentId` references `courses.id`.
- `files.parentId` can reference either `directories.id` or `courses.id`.
- `groups.parentId` references `courses.id`.

Edited: Robert J. Kratz 6. September 2024
