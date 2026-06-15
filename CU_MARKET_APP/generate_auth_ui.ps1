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

Create-File "feature_auth\presentation\login\LoginViewModel.kt" @"
package com.cumarket.app.feature_auth.presentation.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_auth.data.remote.dto.LoginRequestDto
import com.cumarket.app.feature_auth.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _loginState = MutableStateFlow<LoginState>(LoginState())
    val loginState: StateFlow<LoginState> = _loginState.asStateFlow()

    fun onEmailChange(email: String) {
        _loginState.value = _loginState.value.copy(email = email)
    }

    fun onPasswordChange(password: String) {
        _loginState.value = _loginState.value.copy(password = password)
    }

    fun login() {
        val email = _loginState.value.email
        val password = _loginState.value.password
        if(email.isBlank() || password.isBlank()) {
            _loginState.value = _loginState.value.copy(error = "Please enter email and password")
            return
        }

        authRepository.login(LoginRequestDto(email, password)).onEach { result ->
            when (result) {
                is Resource.Success -> {
                    _loginState.value = _loginState.value.copy(
                        isLoading = false,
                        isSuccess = true,
                        error = null
                    )
                }
                is Resource.Error -> {
                    _loginState.value = _loginState.value.copy(
                        isLoading = false,
                        error = result.message ?: "An unexpected error occurred"
                    )
                }
                is Resource.Loading -> {
                    _loginState.value = _loginState.value.copy(isLoading = true)
                }
            }
        }.launchIn(viewModelScope)
    }
}
"@

Create-File "feature_auth\presentation\login\LoginState.kt" @"
package com.cumarket.app.feature_auth.presentation.login

data class LoginState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String? = null
)
"@

Create-File "feature_auth\presentation\login\LoginScreen.kt" @"
package com.cumarket.app.feature_auth.presentation.login

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun LoginScreen(
    onNavigateToHome: () -> Unit,
    onNavigateToSignup: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel()
) {
    val state by viewModel.loginState.collectAsState()

    LaunchedEffect(state.isSuccess) {
        if (state.isSuccess) {
            onNavigateToHome()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "CU Market", style = MaterialTheme.typography.headlineLarge)
        Spacer(modifier = Modifier.height(32.dp))
        
        OutlinedTextField(
            value = state.email,
            onValueChange = viewModel::onEmailChange,
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = state.password,
            onValueChange = viewModel::onPasswordChange,
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = viewModel::login,
            modifier = Modifier.fillMaxWidth(),
            enabled = !state.isLoading
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(24.dp))
            } else {
                Text("Login")
            }
        }
        
        if (state.error != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = state.error!!, color = MaterialTheme.colorScheme.error)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        TextButton(onClick = onNavigateToSignup) {
            Text("Don't have an account? Sign up")
        }
    }
}
"@

Create-File "feature_auth\presentation\signup\SignupViewModel.kt" @"
package com.cumarket.app.feature_auth.presentation.signup

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_auth.data.remote.dto.SignupRequestDto
import com.cumarket.app.feature_auth.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import javax.inject.Inject

@HiltViewModel
class SignupViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _signupState = MutableStateFlow<SignupState>(SignupState())
    val signupState: StateFlow<SignupState> = _signupState.asStateFlow()

    fun onEvent(event: SignupEvent) {
        when(event) {
            is SignupEvent.EmailChanged -> _signupState.value = _signupState.value.copy(email = event.email)
            is SignupEvent.PasswordChanged -> _signupState.value = _signupState.value.copy(password = event.password)
            is SignupEvent.FullNameChanged -> _signupState.value = _signupState.value.copy(fullName = event.fullName)
            is SignupEvent.DepartmentChanged -> _signupState.value = _signupState.value.copy(department = event.department)
            is SignupEvent.HostelChanged -> _signupState.value = _signupState.value.copy(hostel = event.hostel)
            is SignupEvent.Submit -> signup()
        }
    }

    private fun signup() {
        val state = _signupState.value
        if(state.email.isBlank() || state.password.isBlank() || state.fullName.isBlank()) {
            _signupState.value = _signupState.value.copy(error = "Please fill all required fields")
            return
        }

        val request = SignupRequestDto(
            email = state.email,
            password = state.password,
            full_name = state.fullName,
            department = state.department,
            hostel = state.hostel
        )

        authRepository.signup(request).onEach { result ->
            when (result) {
                is Resource.Success -> {
                    _signupState.value = _signupState.value.copy(
                        isLoading = false,
                        isSuccess = true,
                        error = null
                    )
                }
                is Resource.Error -> {
                    _signupState.value = _signupState.value.copy(
                        isLoading = false,
                        error = result.message ?: "An unexpected error occurred"
                    )
                }
                is Resource.Loading -> {
                    _signupState.value = _signupState.value.copy(isLoading = true)
                }
            }
        }.launchIn(viewModelScope)
    }
}
"@

Create-File "feature_auth\presentation\signup\SignupScreen.kt" @"
package com.cumarket.app.feature_auth.presentation.signup

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun SignupScreen(
    onNavigateToHome: () -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: SignupViewModel = hiltViewModel()
) {
    val state by viewModel.signupState.collectAsState()

    LaunchedEffect(state.isSuccess) {
        if (state.isSuccess) {
            onNavigateToHome()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "Sign Up", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(32.dp))
        
        OutlinedTextField(
            value = state.fullName,
            onValueChange = { viewModel.onEvent(SignupEvent.FullNameChanged(it)) },
            label = { Text("Full Name") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = state.email,
            onValueChange = { viewModel.onEvent(SignupEvent.EmailChanged(it)) },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = state.password,
            onValueChange = { viewModel.onEvent(SignupEvent.PasswordChanged(it)) },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = { viewModel.onEvent(SignupEvent.Submit) },
            modifier = Modifier.fillMaxWidth(),
            enabled = !state.isLoading
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(24.dp))
            } else {
                Text("Create Account")
            }
        }
        
        if (state.error != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(text = state.error!!, color = MaterialTheme.colorScheme.error)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        TextButton(onClick = onNavigateBack) {
            Text("Already have an account? Login")
        }
    }
}
"@

Create-File "feature_auth\presentation\signup\SignupState.kt" @"
package com.cumarket.app.feature_auth.presentation.signup

data class SignupState(
    val email: String = "",
    val password: String = "",
    val fullName: String = "",
    val department: String = "",
    val hostel: String = "",
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String? = null
)

sealed class SignupEvent {
    data class EmailChanged(val email: String) : SignupEvent()
    data class PasswordChanged(val password: String) : SignupEvent()
    data class FullNameChanged(val fullName: String) : SignupEvent()
    data class DepartmentChanged(val department: String) : SignupEvent()
    data class HostelChanged(val hostel: String) : SignupEvent()
    object Submit : SignupEvent()
}
"@
