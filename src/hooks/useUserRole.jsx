import useAuth from './useAuth';
import useAxiosPublic from './useAxiosPublic';
import { useQuery } from '@tanstack/react-query';

const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosPublic = useAxiosPublic();

  const { data: role = 'user', isLoading: roleLoading, refetch } = useQuery({
    queryKey: ['userRole', user?.email],
    enabled: !authLoading && !!user?.email,
    queryFn: async () => {
      const res = await axiosPublic.get(`/users/role/${user?.email}`);
      return res.data.role;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  return { role, roleLoading: authLoading || roleLoading, refetch };
};

export default useUserRole;
