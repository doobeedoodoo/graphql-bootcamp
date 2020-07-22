import { GraphQLServer } from "graphql-yoga"
import uuidv4 from "uuid/v4"

const users = [
  {
    id: "u1",
    name: "Mark",
    email: "mark@example.com",
    age: 36
  },
  {
    id: "u2",
    name: "Anna",
    email: "anna@example.com"
  }
]

const posts = [
  {
    id: "p1",
    title: "How to Wash Your Pwet",
    body: "This is how you wash your pwet.",
    published: true,
    author: "u1"
  },
  {
    id: "p2",
    title: "How to Make Your Tae Glow",
    body: "Glow glow glow tae glow!",
    published: false,
    author: "u1"
  },
  {
    id: "p3",
    title: "How to Make Your Tite Smile",
    body: "Cheeesee tite cheese",
    published: false,
    author: "u2"
  }
]

const comments = [
  {
    id: "c1",
    text: "This is the best post evah!",
    author: "u1",
    post: "p1"
  },
  {
    id: "c2",
    text: "Good vibes! Keep it up!",
    author: "u1",
    post: "p2"
  },
  {
    id: "c3",
    text: "No comment.",
    author: "u2",
    post: "p2"
  }
]

// Type definitions (schema)
const typeDefs = `
    type Query {
      users(query: String): [User!]!
      posts(query: String): [Post!]!
      me: User!
      post: Post!
      comments: [Comment!]!
    }

    type Mutation {
      createUser(data: CreateUserInput!): User!
      createPost(data: createPostInput!): Post!
      createComment(data: createCommentInput!): Comment!
    }

    input CreateUserInput {
      name: String!
      email: String!
      age: Int
    }

    input createPostInput {
      title: String!
      body: String!
      published: Boolean!
      author: ID!
    }

    input createCommentInput {
      text: String!
      author: ID!
      post: ID!
    }

    type User {
      id: ID!
      name: String!
      email: String!
      age: Int
      posts: [Post!]!
      comments: [Comment!]!
    }

    type Post {
      id: ID!
      title: String!
      body: String!
      published: Boolean!
      author: User!
      comments: [Comment]
    }

    type Comment {
      id: ID!
      text: String!
      author: User!
      post: Post!
    }

`

// Resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users
      }
      return users.filter(user => {
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts
      }

      return posts.filter(post => {
        return post.title.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    me() {
      return {
        id: "123456",
        name: "Mac",
        email: "badong@gmail.com"
      }
    },
    post() {
      return {
        id: "092",
        title: "GraphQL 101",
        body: "",
        published: false
      }
    },
    comments() {
      return comments
    }
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => user.email === args.data.email)

      if (emailTaken) {
        throw new Error("Email taken.")
      }

      const user = {
        id: uuidv4(),
        ...args.data
      }

      users.push(user)

      return user
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some(user => user.id === args.data.author)

      if (!userExists) {
        throw new Error("User not found.")
      }

      const post = {
        id: uuidv4(),
        title: args.title,
        ...args.data
      }

      posts.push(post)

      return post
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some(user => user.id === args.data.author)
      const postExists = posts.some(post => post.id === args.data.post && post.published)

      if (!userExists || !postExists) {
        throw new Error("Unable to find user or post")
      }

      const comment = {
        id: uuidv4(),
        ...args.data
      }

      comments.push(comment)

      return comment
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author
      })
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.post === parent.id
      })
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter(post => {
        return post.author === parent.id
      })
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => {
        return comment.author === parent.id
      })
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author
      })
    },
    post(parent, args, ctx, info) {
      return posts.find(post => {
        return post.id === parent.post
      })
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
})

server.start(() => {
  console.log("The server is up!")
})
