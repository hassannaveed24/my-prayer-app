import React, { useMemo, useState } from 'react';

const useAuthContextValue = () => {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user: { value: user, set: setUser },
    }),
    [user, setUser],
  );

  return value;
};

export default useAuthContextValue;
