/**
 * ==============================================================================
 * MongoDB Schema & Index Specification
 * Database: cbit_freshers
 * Collection: faculty_invitations
 * ==============================================================================
 *
 * Each document in the 'faculty_invitations' collection adheres to the following structure:
 *
 * {
 *   _id: ObjectId("..."),
 *   name: String (required, e.g. "Dr. M. Mukunda Vani"),
 *   designation: String (e.g. "Professor & HOD", "JR Faculty"),
 *   department: String (required, e.g. "Chemical Engineering", "Mathematics"),
 *   faculty_group: String (enum: ["Junior Batch Faculty", "Our Batch Faculty"]),
 *   status: String (enum: ["Not invited", "Invited", "Confirmed", "Unable to attend"]),
 *   invited_by: String | null (e.g. "Harshith (Organizing Lead)"),
 *   invited_at: ISODate / ISO String | null,
 *   notes: String,
 *   created_at: ISODate / ISO String,
 *   updated_at: ISODate / ISO String,
 *   updated_by: String | null
 * }
 *
 * PERFORMANCE INDEXES:
 * 1. db.faculty_invitations.createIndex({ faculty_group: 1 })
 *    - Optimizes filtering by Junior Batch vs Our Batch
 *
 * 2. db.faculty_invitations.createIndex({ status: 1 })
 *    - Optimizes status filters (e.g. Needs Invitation, Confirmed)
 *
 * 3. db.faculty_invitations.createIndex({ department: 1 })
 *    - Optimizes department dropdown lookups
 *
 * 4. db.faculty_invitations.createIndex({ name: 1 })
 *    - Optimizes alphabetical sorting and duplicate lookups
 *
 * OPTIONAL JSON SCHEMA VALIDATOR (Run in mongosh / MongoDB Compass):
 */

export const collectionValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "department", "faculty_group", "status"],
    properties: {
      name: {
        bsonType: "string",
        description: "Must be a string and is required"
      },
      designation: {
        bsonType: ["string", "null"]
      },
      department: {
        bsonType: "string",
        description: "Must be a string and is required"
      },
      faculty_group: {
        enum: ["Junior Batch Faculty", "Our Batch Faculty"],
        description: "Must be either 'Junior Batch Faculty' or 'Our Batch Faculty'"
      },
      status: {
        enum: ["Not invited", "Invited", "Confirmed", "Unable to attend"],
        description: "Must be one of the four allowed invitation states"
      },
      invited_by: {
        bsonType: ["string", "null"]
      },
      invited_at: {
        bsonType: ["string", "null"]
      },
      notes: {
        bsonType: ["string", "null"]
      }
    }
  }
};
