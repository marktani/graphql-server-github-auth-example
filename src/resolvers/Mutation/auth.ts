import { Context, User } from '../../utils'
import { getGithubToken, getGithubUser, GithubUser } from '../../github'
import * as jwt from 'jsonwebtoken'

// Helpers -------------------------------------------------------------------

async function getGraphcoolUser(ctx: Context, githubUserId: string): Promise<User> {
  const user = await ctx.db.query.user({ where: { githubUserId }})
  return user
}

async function createGraphcoolUser(ctx, githubUser: GithubUser): Promise<User> {
  const user = await ctx.db.mutation.createUser({ data: githubUser })
  return user
}

// Resolvers -----------------------------------------------------------------

export const auth = {
  authenticate: async (parent, { githubCode }, ctx: Context, info) => {
    const githubToken = await getGithubToken(githubCode)
    const githubUser = await getGithubUser(githubToken)

    let user = await getGraphcoolUser(ctx, githubUser.id)

    if (!user) {
      user = await createGraphcoolUser(ctx, githubUser)
      console.log(user)
    }

    return {
      token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET),
      user
    }
  }
}

// ---------------------------------------------------------------------------