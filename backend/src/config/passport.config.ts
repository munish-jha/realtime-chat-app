import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Env } from "../config/env.config";
import { UnauthorizedException } from "../utils/app-error";
import { findByIdUserService } from "../services/user.service";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const token = req.cookie.accessToken;
          if (!token) throw new UnauthorizedException("Unauthorized Access");
          return token;
        },
      ]),
      secretOrKey: Env.JWT_SECRET,
      audience: ["user"],
      algorithms: ["HS256"],
    },
    async ({ userId }, done) => {
      try {
        const user = userId && (await findByIdUserService(userId));
        return done(null, user || false);
      } catch (error) {
        return done(null, false);
      }
    }
  )
);


export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
  failWithError: true,
});