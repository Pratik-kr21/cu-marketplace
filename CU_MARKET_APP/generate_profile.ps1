$baseDir = "g:\project\college marketplae\CU_MARKET_APP\app\src\main\java\com\cumarket\app"

function Create-File {
    param([string]$path, [string]$content)
    $fullPath = Join-Path $baseDir $path
    $dir = Split-Path $fullPath
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    Set-Content -Path $fullPath -Value $content -Encoding UTF8
}

Create-File "feature_profile\data\remote\ProfileApi.kt" @"
package com.cumarket.app.feature_profile.data.remote

import com.cumarket.app.feature_auth.data.remote.dto.UserDto
import com.cumarket.app.feature_marketplace.data.remote.dto.ItemDto
import retrofit2.http.GET

interface ProfileApi {
    @GET("auth/me")
    suspend fun getMyProfile(): UserDto

    @GET("items/my")
    suspend fun getMyItems(): List<ItemDto>

    @GET("items/saved")
    suspend fun getSavedItems(): List<ItemDto>
}
"@

Create-File "feature_profile\domain\repository\ProfileRepository.kt" @"
package com.cumarket.app.feature_profile.domain.repository

import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_auth.domain.model.User
import com.cumarket.app.feature_marketplace.domain.model.Item
import kotlinx.coroutines.flow.Flow

interface ProfileRepository {
    fun getMyProfile(): Flow<Resource<User>>
    fun getMyItems(): Flow<Resource<List<Item>>>
    fun getSavedItems(): Flow<Resource<List<Item>>>
}
"@

Create-File "feature_profile\data\repository\ProfileRepositoryImpl.kt" @"
package com.cumarket.app.feature_profile.data.repository

import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_auth.domain.model.User
import com.cumarket.app.feature_marketplace.domain.model.Item
import com.cumarket.app.feature_profile.data.remote.ProfileApi
import com.cumarket.app.feature_profile.domain.repository.ProfileRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class ProfileRepositoryImpl @Inject constructor(
    private val api: ProfileApi
) : ProfileRepository {

    override fun getMyProfile(): Flow<Resource<User>> = flow {
        emit(Resource.Loading())
        try {
            val user = api.getMyProfile().toUser()
            emit(Resource.Success(user))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }

    override fun getMyItems(): Flow<Resource<List<Item>>> = flow {
        emit(Resource.Loading())
        try {
            val items = api.getMyItems().map { it.toItem() }
            emit(Resource.Success(items))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }

    override fun getSavedItems(): Flow<Resource<List<Item>>> = flow {
        emit(Resource.Loading())
        try {
            val items = api.getSavedItems().map { it.toItem() }
            emit(Resource.Success(items))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }
}
"@

Create-File "feature_profile\di\ProfileModule.kt" @"
package com.cumarket.app.feature_profile.di

import com.cumarket.app.feature_profile.data.remote.ProfileApi
import com.cumarket.app.feature_profile.data.repository.ProfileRepositoryImpl
import com.cumarket.app.feature_profile.domain.repository.ProfileRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ProfileModule {

    @Provides
    @Singleton
    fun provideProfileApi(retrofit: Retrofit): ProfileApi {
        return retrofit.create(ProfileApi::class.java)
    }

    @Provides
    @Singleton
    fun provideProfileRepository(api: ProfileApi): ProfileRepository {
        return ProfileRepositoryImpl(api)
    }
}
"@

Create-File "feature_profile\presentation\profile\ProfileViewModel.kt" @"
package com.cumarket.app.feature_profile.presentation.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cumarket.app.core.datastore.AuthDataStore
import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_auth.domain.model.User
import com.cumarket.app.feature_marketplace.domain.model.Item
import com.cumarket.app.feature_profile.domain.repository.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileState(
    val user: User? = null,
    val myItems: List<Item> = emptyList(),
    val savedItems: List<Item> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val repository: ProfileRepository,
    private val authDataStore: AuthDataStore
) : ViewModel() {

    private val _state = MutableStateFlow(ProfileState())
    val state: StateFlow<ProfileState> = _state.asStateFlow()

    init {
        loadProfileData()
    }

    private fun loadProfileData() {
        repository.getMyProfile().onEach { result ->
            when (result) {
                is Resource.Success -> _state.value = _state.value.copy(user = result.data, isLoading = false)
                is Resource.Error -> _state.value = _state.value.copy(error = result.message, isLoading = false)
                is Resource.Loading -> _state.value = _state.value.copy(isLoading = true)
            }
        }.launchIn(viewModelScope)

        repository.getMyItems().onEach { result ->
            if (result is Resource.Success) {
                _state.value = _state.value.copy(myItems = result.data ?: emptyList())
            }
        }.launchIn(viewModelScope)

        repository.getSavedItems().onEach { result ->
            if (result is Resource.Success) {
                _state.value = _state.value.copy(savedItems = result.data ?: emptyList())
            }
        }.launchIn(viewModelScope)
    }

    fun logout(onLogoutComplete: () -> Unit) {
        viewModelScope.launch {
            authDataStore.clearToken()
            onLogoutComplete()
        }
    }
}
"@

Create-File "feature_profile\presentation\profile\ProfileScreen.kt" @"
package com.cumarket.app.feature_profile.presentation.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onNavigateToLogin: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile") },
                actions = {
                    IconButton(onClick = { viewModel.logout(onNavigateToLogin) }) {
                        Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = "Logout")
                    }
                }
            )
        }
    ) { padding ->
        if (state.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (state.error != null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = state.error!!, color = MaterialTheme.colorScheme.error)
            }
        } else if (state.user != null) {
            val user = state.user!!
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Avatar
                val avatarUrl = user.avatarUrl ?: "https://ui-avatars.com/api/?name=\${user.fullName}"
                AsyncImage(
                    model = avatarUrl,
                    contentDescription = "Avatar",
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
                Spacer(modifier = Modifier.height(16.dp))

                Text(text = user.fullName, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text(text = user.email, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Department: \${user.department}", style = MaterialTheme.typography.bodyMedium)
                        Text("Hostel: \${user.hostel}", style = MaterialTheme.typography.bodyMedium)
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Stats / Lists
                Text(
                    text = "My Listings (\${state.myItems.size})",
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.align(Alignment.Start)
                )
                Spacer(modifier = Modifier.height(8.dp))
                // Here we would list myItems horizontally or in a sub-list

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Saved Items (\${state.savedItems.size})",
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.align(Alignment.Start)
                )
                Spacer(modifier = Modifier.height(8.dp))
                // Here we would list savedItems horizontally or in a sub-list
            }
        }
    }
}
"@
