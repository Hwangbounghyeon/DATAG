import { getUserProfile } from "@/app/actions/auth";
import { UserType } from "@/types/auth";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
interface UserState {
  profile: UserType | null;
  loading: boolean;
  error: string | null;
}

export const fetchUserProfile = createAsyncThunk(
  "user",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfile();
      console.log("userData response", response);
      if (!response.data || !response.data.data) {
        throw new Error(response.error || "Failed to fetch profile");
      } else {
        console.log("userData response.data", response.data);
        return response.data.data;
      }
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<UserType>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.profile = null;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;
export const { clearUserProfile, updateProfile } = userSlice.actions;
