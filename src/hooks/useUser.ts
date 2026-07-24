import { useEffect, useState, useMemo } from "react";

import { api } from "../helpers/api/apiCore";

const useUser = (): { user: any | void } => {
  const [user, setuser] = useState();

  useEffect(() => {
    if (api.isUserAuthenticated()) {
      setuser(api.getLoggedInUser());
    }
  }, [api]);

  return { user };
};

export default useUser;
