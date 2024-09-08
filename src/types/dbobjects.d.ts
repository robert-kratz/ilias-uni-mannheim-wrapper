// User table
interface User {
    id: string; // UUID
    email: string;
    createdAt: Date;
    lastAuth: Date;
}

// Course table
interface Course {
    id: string; // UUID
    title: string;
    description: string;
    year: string;
    userid: string; // Reference to User.id
    createdAt: Date;
    updatedAt: Date | null;
}

// Group table
interface Group {
    id: string; // UUID
    title: string;
    description: string;
    year: string;
    parentId: string | null; // Reference to Course.id (When this is null, it is a top-level group)
    userid: string; // Reference to User.id
    createdAt: Date;
    updatedAt: Date | null;
}

// Directory table
interface Directory {
    id: string; // UUID
    name: string;
    description: string;
    parentId: string; // Reference to Course.id
    userid: string; // Reference to User.id
    createdAt: Date;
    updatedAt: Date | null;
}

// File table
interface File {
    id: string; // UUID
    name: string;
    parentId: string; // Reference to Course.id or Directory.id
    userid: string; // Reference to User.id
    createdAt: Date;
    updatedAt: Date | null;
}

export { User, Course, Group, Directory, File };
