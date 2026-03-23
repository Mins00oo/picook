import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/components/layout/AppLayout';
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/dashboard/Dashboard';
import RecipeList from '@/pages/recipes/RecipeList';
import RecipeForm from '@/pages/recipes/RecipeForm';
import RecipeDetail from '@/pages/recipes/RecipeDetail';
import RecipeBulkUpload from '@/pages/recipes/RecipeBulkUpload';
import IngredientList from '@/pages/ingredients/IngredientList';
import IngredientForm from '@/pages/ingredients/IngredientForm';
import IngredientBulkUpload from '@/pages/ingredients/IngredientBulkUpload';
import CategoryManage from '@/pages/ingredients/CategoryManage';
import ShortsCacheList from '@/pages/shorts/ShortsCacheList';
import ShortsCacheDetail from '@/pages/shorts/ShortsCacheDetail';
import ShortsStats from '@/pages/shorts/ShortsStats';
import UserList from '@/pages/users/UserList';
import UserDetail from '@/pages/users/UserDetail';
import FeedbackList from '@/pages/feedback/FeedbackList';
import FeedbackDetail from '@/pages/feedback/FeedbackDetail';
import UserStats from '@/pages/stats/UserStats';
import RecipeStats from '@/pages/stats/RecipeStats';
import IngredientStats from '@/pages/stats/IngredientStats';
import CoachingStats from '@/pages/stats/CoachingStats';
import ShortsStatsPage from '@/pages/stats/ShortsStats';
import RankingStats from '@/pages/stats/RankingStats';
import AdminAccountList from '@/pages/accounts/AdminAccountList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={koKR}>
        <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="recipes" element={<RecipeList />} />
              <Route path="recipes/new" element={<RecipeForm />} />
              <Route path="recipes/:id" element={<RecipeDetail />} />
              <Route path="recipes/:id/edit" element={<RecipeForm />} />
              <Route path="recipes/bulk-upload" element={<RecipeBulkUpload />} />
              <Route path="ingredients" element={<IngredientList />} />
              <Route path="ingredients/new" element={<IngredientForm />} />
              <Route path="ingredients/:id/edit" element={<IngredientForm />} />
              <Route path="ingredients/bulk-upload" element={<IngredientBulkUpload />} />
              <Route path="ingredients/categories" element={<CategoryManage />} />
              <Route path="shorts" element={<ShortsCacheList />} />
              <Route path="shorts/:id" element={<ShortsCacheDetail />} />
              <Route path="shorts/stats" element={<ShortsStats />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="feedback" element={<FeedbackList />} />
              <Route path="feedback/:id" element={<FeedbackDetail />} />
              <Route path="stats/users" element={<UserStats />} />
              <Route path="stats/recipes" element={<RecipeStats />} />
              <Route path="stats/ingredients" element={<IngredientStats />} />
              <Route path="stats/coaching" element={<CoachingStats />} />
              <Route path="stats/shorts" element={<ShortsStatsPage />} />
              <Route path="stats/ranking" element={<RankingStats />} />
              <Route path="accounts" element={<AdminAccountList />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
