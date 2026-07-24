// components/guards/AuthGuard.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { api, setAuthorization } from "@helpers/api/apiCore";
import { restoreAuthSession } from "@redux/common/authSlice";

const AuthGuard = ({ loginPath }: { loginPath: string }) => {
  const { user, userLoggedIn } = useSelector((s: RootState) => s.Auth);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const session = useMemo(() => api.getLoggedInUser(), [user, userLoggedIn]);
  const sessionUser = session?.user ?? session;

  useEffect(() => {
    if (!sessionUser) return;

    if (!user || !userLoggedIn) {
      dispatch(restoreAuthSession(session));
    }

    const token = session?.token ?? sessionUser.token ?? null;
    if (token) {
      setAuthorization(token);
    }
  }, [dispatch, session, sessionUser, user, userLoggedIn]);

  if ((!userLoggedIn && !sessionUser) || (user === null && !sessionUser)) {
    return (
      <Navigate
        to={{
          pathname: loginPath,
          search: "?next=" + encodeURIComponent(location.pathname),
        }}
        replace
      />
    );
  }

  return <Outlet />;

};

export default AuthGuard;
