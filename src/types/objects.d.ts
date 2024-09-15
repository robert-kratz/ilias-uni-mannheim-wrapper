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
    userId: string; // Reference to User.id
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
    userId: string; // Reference to User.id
    createdAt: Date;
    updatedAt: Date | null;
}

// Directory table
interface Directory {
    id: string; // UUID
    name: string;
    description: string;
    parentId: string; // Reference to Course.id
    userId: string; // Reference to User.id
    courseId: string; // Reference to Course.id
    createdAt: Date;
    updatedAt: Date | null;
}

// File table
interface File {
    id: string; // UUID
    name: string;
    parentId: string; // Reference to Course.id or Directory.id
    userId: string; // Reference to User.id
    createdAt: Date;
    updatedAt: Date | null;
}

interface StaticContentAlert {
    title: string;
    description: string;
    type: 'info' | 'warning' | 'error';
    active: boolean;
}

interface SearchDataResponseItem {
    name: string; // Name of the entity
    courseId: string; // Course ID of the entity
    id: string; // ID of the entity
    parentId: string | null; // Parent ID of the entity
    courseYear: string | null; // Year of the course
    courseTitle: string | null; // Title of the course
    parentName: string | null; // Name of the parent entity
    favorite: boolean; // Is the entity favorite
    matchingEntityType: 'directory' | 'file' | 'course' | 'none'; // Type of entity matched
}

type ScrapeEvent = {
    type: 'start' | 'indexing' | 'finish' | 'error';
    name: string | null;
    ref_id: string | null;
    courseId: string | null;
    error?: string;
};

export { User, Course, Group, Directory, File, StaticContentAlert, SearchDataResponseItem, ScrapeEvent };
