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

Create-File "core\utils\Resource.kt" @"
package com.cumarket.app.core.utils

sealed class Resource<T>(val data: T? = null, val message: String? = null) {
    class Success<T>(data: T) : Resource<T>(data)
    class Error<T>(message: String, data: T? = null) : Resource<T>(data, message)
    class Loading<T>(data: T? = null) : Resource<T>(data)
}
"@

Create-File "feature_auth\domain\model\User.kt" @"
package com.cumarket.app.feature_auth.domain.model

data class User(
    val id: String,
    val email: String,
    val fullName: String,
    val avatarUrl: String?
)
"@

Create-File "feature_auth\data\remote\dto\AuthResponseDto.kt" @"
package com.cumarket.app.feature_auth.data.remote.dto

import com.cumarket.app.feature_auth.domain.model.User

data class AuthResponseDto(
    val token: String,
    val user: UserDto
)

data class UserDto(
    val id: String,
    val email: String,
    val full_name: String,
    val avatar_url: String?
) {
    fun toUser(): User {
        return User(
            id = id,
            email = email,
            fullName = full_name,
            avatarUrl = avatar_url
        )
    }
}
"@

Create-File "feature_auth\data\remote\dto\LoginRequestDto.kt" @"
package com.cumarket.app.feature_auth.data.remote.dto

data class LoginRequestDto(
    val email: String,
    val password: String
)
"@

Create-File "feature_auth\data\remote\dto\SignupRequestDto.kt" @"
package com.cumarket.app.feature_auth.data.remote.dto

data class SignupRequestDto(
    val email: String,
    val password: String,
    val full_name: String,
    val department: String,
    val hostel: String
)
"@

Create-File "feature_auth\data\remote\AuthApi.kt" @"
package com.cumarket.app.feature_auth.data.remote

import com.cumarket.app.feature_auth.data.remote.dto.AuthResponseDto
import com.cumarket.app.feature_auth.data.remote.dto.LoginRequestDto
import com.cumarket.app.feature_auth.data.remote.dto.SignupRequestDto
import com.cumarket.app.feature_auth.data.remote.dto.UserDto
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequestDto): AuthResponseDto

    @POST("auth/signup")
    suspend fun signup(@Body request: SignupRequestDto): AuthResponseDto

    @GET("auth/me")
    suspend fun getMe(): UserDto
}
"@

Create-File "feature_auth\domain\repository\AuthRepository.kt" @"
package com.cumarket.app.feature_auth.domain.repository

import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_auth.data.remote.dto.LoginRequestDto
import com.cumarket.app.feature_auth.data.remote.dto.SignupRequestDto
import com.cumarket.app.feature_auth.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    fun login(request: LoginRequestDto): Flow<Resource<User>>
    fun signup(request: SignupRequestDto): Flow<Resource<User>>
    fun getMe(): Flow<Resource<User>>
    suspend fun logout()
    val isUserLoggedIn: Flow<Boolean>
}
"@

Create-File "feature_auth\data\repository\AuthRepositoryImpl.kt" @"
package com.cumarket.app.feature_auth.data.repository

import com.cumarket.app.core.datastore.AuthDataStore
import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_auth.data.remote.AuthApi
import com.cumarket.app.feature_auth.data.remote.dto.LoginRequestDto
import com.cumarket.app.feature_auth.data.remote.dto.SignupRequestDto
import com.cumarket.app.feature_auth.domain.model.User
import com.cumarket.app.feature_auth.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val api: AuthApi,
    private val dataStore: AuthDataStore
) : AuthRepository {

    override val isUserLoggedIn: Flow<Boolean> = dataStore.tokenFlow.map { it != null }

    override fun login(request: LoginRequestDto): Flow<Resource<User>> = flow {
        emit(Resource.Loading())
        try {
            val response = api.login(request)
            dataStore.saveToken(response.token)
            emit(Resource.Success(response.user.toUser()))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }

    override fun signup(request: SignupRequestDto): Flow<Resource<User>> = flow {
        emit(Resource.Loading())
        try {
            val response = api.signup(request)
            dataStore.saveToken(response.token)
            emit(Resource.Success(response.user.toUser()))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }

    override fun getMe(): Flow<Resource<User>> = flow {
        emit(Resource.Loading())
        try {
            val userDto = api.getMe()
            emit(Resource.Success(userDto.toUser()))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }

    override suspend fun logout() {
        dataStore.clearToken()
    }
}
"@

Create-File "feature_auth\di\AuthModule.kt" @"
package com.cumarket.app.feature_auth.di

import com.cumarket.app.core.datastore.AuthDataStore
import com.cumarket.app.feature_auth.data.remote.AuthApi
import com.cumarket.app.feature_auth.data.repository.AuthRepositoryImpl
import com.cumarket.app.feature_auth.domain.repository.AuthRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AuthModule {

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi {
        return retrofit.create(AuthApi::class.java)
    }

    @Provides
    @Singleton
    fun provideAuthRepository(api: AuthApi, dataStore: AuthDataStore): AuthRepository {
        return AuthRepositoryImpl(api, dataStore)
    }
}
"@
