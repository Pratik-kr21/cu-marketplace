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

Create-File "feature_listing\data\remote\dto\ListingUpdateRequestDto.kt" @"
package com.cumarket.app.feature_listing.data.remote.dto

data class ListingUpdateRequestDto(
    val price: Double? = null,
    val description: String? = null,
    val is_available: Boolean? = null
)
"@

Create-File "feature_listing\data\remote\ListingApi.kt" @"
package com.cumarket.app.feature_listing.data.remote

import com.cumarket.app.feature_listing.data.remote.dto.ListingUpdateRequestDto
import com.cumarket.app.feature_marketplace.data.remote.dto.ItemDto
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ListingApi {
    @Multipart
    @POST("items")
    suspend fun createListing(
        @Part("title") title: RequestBody,
        @Part("description") description: RequestBody,
        @Part("price") price: RequestBody?,
        @Part("is_barter_only") isBarterOnly: RequestBody,
        @Part("is_free") isFree: RequestBody,
        @Part("accept_hybrid") acceptHybrid: RequestBody,
        @Part("category") category: RequestBody,
        @Part("condition") condition: RequestBody,
        @Part("hostel_area") hostelArea: RequestBody,
        @Part("quantity") quantity: RequestBody,
        @Part images: List<MultipartBody.Part>
    ): ItemDto

    @PATCH("items/{id}")
    suspend fun updateListing(
        @Path("id") id: String,
        @Body request: ListingUpdateRequestDto
    ): ItemDto

    @DELETE("items/{id}")
    suspend fun deleteListing(@Path("id") id: String): Response<Unit>
}
"@

Create-File "feature_listing\domain\repository\ListingRepository.kt" @"
package com.cumarket.app.feature_listing.domain.repository

import android.net.Uri
import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_listing.data.remote.dto.ListingUpdateRequestDto
import com.cumarket.app.feature_marketplace.domain.model.Item
import kotlinx.coroutines.flow.Flow

interface ListingRepository {
    fun createListing(
        title: String,
        description: String,
        price: Double?,
        isBarterOnly: Boolean,
        isFree: Boolean,
        acceptHybrid: Boolean,
        category: String,
        condition: String,
        hostelArea: String,
        quantity: Int,
        imageUris: List<Uri>
    ): Flow<Resource<Item>>

    fun updateListing(id: String, request: ListingUpdateRequestDto): Flow<Resource<Item>>
    
    fun deleteListing(id: String): Flow<Resource<Unit>>
}
"@

Create-File "feature_listing\data\repository\ListingRepositoryImpl.kt" @"
package com.cumarket.app.feature_listing.data.repository

import android.content.Context
import android.net.Uri
import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_listing.data.remote.ListingApi
import com.cumarket.app.feature_listing.data.remote.dto.ListingUpdateRequestDto
import com.cumarket.app.feature_listing.domain.repository.ListingRepository
import com.cumarket.app.feature_marketplace.domain.model.Item
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.HttpException
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import javax.inject.Inject

class ListingRepositoryImpl @Inject constructor(
    private val api: ListingApi,
    @ApplicationContext private val context: Context
) : ListingRepository {

    override fun createListing(
        title: String,
        description: String,
        price: Double?,
        isBarterOnly: Boolean,
        isFree: Boolean,
        acceptHybrid: Boolean,
        category: String,
        condition: String,
        hostelArea: String,
        quantity: Int,
        imageUris: List<Uri>
    ): Flow<Resource<Item>> = flow {
        emit(Resource.Loading())
        try {
            val titleBody = title.toRequestBody("text/plain".toMediaTypeOrNull())
            val descBody = description.toRequestBody("text/plain".toMediaTypeOrNull())
            val priceBody = price?.toString()?.toRequestBody("text/plain".toMediaTypeOrNull())
            val barterBody = isBarterOnly.toString().toRequestBody("text/plain".toMediaTypeOrNull())
            val freeBody = isFree.toString().toRequestBody("text/plain".toMediaTypeOrNull())
            val hybridBody = acceptHybrid.toString().toRequestBody("text/plain".toMediaTypeOrNull())
            val categoryBody = category.toRequestBody("text/plain".toMediaTypeOrNull())
            val conditionBody = condition.toRequestBody("text/plain".toMediaTypeOrNull())
            val hostelBody = hostelArea.toRequestBody("text/plain".toMediaTypeOrNull())
            val quantityBody = quantity.toString().toRequestBody("text/plain".toMediaTypeOrNull())

            val imageParts = imageUris.mapNotNull { uri ->
                getFileFromUri(uri)?.let { file ->
                    val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                    MultipartBody.Part.createFormData("images", file.name, requestFile)
                }
            }

            val itemDto = api.createListing(
                title = titleBody,
                description = descBody,
                price = priceBody,
                isBarterOnly = barterBody,
                isFree = freeBody,
                acceptHybrid = hybridBody,
                category = categoryBody,
                condition = conditionBody,
                hostelArea = hostelBody,
                quantity = quantityBody,
                images = imageParts
            )

            emit(Resource.Success(itemDto.toItem()))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }

    override fun updateListing(id: String, request: ListingUpdateRequestDto): Flow<Resource<Item>> = flow {
        emit(Resource.Loading())
        try {
            val itemDto = api.updateListing(id, request)
            emit(Resource.Success(itemDto.toItem()))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }

    override fun deleteListing(id: String): Flow<Resource<Unit>> = flow {
        emit(Resource.Loading())
        try {
            val response = api.deleteListing(id)
            if (response.isSuccessful) {
                emit(Resource.Success(Unit))
            } else {
                emit(Resource.Error("Failed to delete listing"))
            }
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }

    private fun getFileFromUri(uri: Uri): File? {
        val inputStream = context.contentResolver.openInputStream(uri) ?: return null
        val tempFile = File.createTempFile("upload_", ".jpg", context.cacheDir)
        val outputStream = FileOutputStream(tempFile)
        inputStream.copyTo(outputStream)
        inputStream.close()
        outputStream.close()
        return tempFile
    }
}
"@

Create-File "feature_listing\di\ListingModule.kt" @"
package com.cumarket.app.feature_listing.di

import android.content.Context
import com.cumarket.app.feature_listing.data.remote.ListingApi
import com.cumarket.app.feature_listing.data.repository.ListingRepositoryImpl
import com.cumarket.app.feature_listing.domain.repository.ListingRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ListingModule {

    @Provides
    @Singleton
    fun provideListingApi(retrofit: Retrofit): ListingApi {
        return retrofit.create(ListingApi::class.java)
    }

    @Provides
    @Singleton
    fun provideListingRepository(
        api: ListingApi,
        @ApplicationContext context: Context
    ): ListingRepository {
        return ListingRepositoryImpl(api, context)
    }
}
"@

Create-File "feature_listing\presentation\create_listing\CreateListingViewModel.kt" @"
package com.cumarket.app.feature_listing.presentation.create_listing

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_listing.domain.repository.ListingRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import javax.inject.Inject

data class CreateListingState(
    val title: String = "",
    val description: String = "",
    val price: String = "",
    val category: String = "Electronics",
    val condition: String = "Good",
    val hostelArea: String = "Hostel 1",
    val quantity: String = "1",
    val isBarterOnly: Boolean = false,
    val isFree: Boolean = false,
    val acceptHybrid: Boolean = false,
    val imageUris: List<Uri> = emptyList(),
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class CreateListingViewModel @Inject constructor(
    private val repository: ListingRepository
) : ViewModel() {

    private val _state = MutableStateFlow(CreateListingState())
    val state: StateFlow<CreateListingState> = _state.asStateFlow()

    fun onTitleChange(title: String) { _state.value = _state.value.copy(title = title) }
    fun onDescriptionChange(desc: String) { _state.value = _state.value.copy(description = desc) }
    fun onPriceChange(price: String) { _state.value = _state.value.copy(price = price) }
    fun onCategoryChange(category: String) { _state.value = _state.value.copy(category = category) }
    fun onConditionChange(condition: String) { _state.value = _state.value.copy(condition = condition) }
    fun onHostelAreaChange(area: String) { _state.value = _state.value.copy(hostelArea = area) }
    fun onQuantityChange(qty: String) { _state.value = _state.value.copy(quantity = qty) }
    fun onBarterOnlyChange(isBarter: Boolean) { _state.value = _state.value.copy(isBarterOnly = isBarter) }
    fun onFreeChange(isFree: Boolean) { _state.value = _state.value.copy(isFree = isFree) }
    fun onHybridChange(isHybrid: Boolean) { _state.value = _state.value.copy(acceptHybrid = isHybrid) }
    fun onImagesAdded(uris: List<Uri>) {
        _state.value = _state.value.copy(imageUris = _state.value.imageUris + uris)
    }

    fun submitListing() {
        val s = _state.value
        if (s.title.isBlank() || s.description.isBlank()) {
            _state.value = _state.value.copy(error = "Title and Description are required")
            return
        }

        val priceVal = s.price.toDoubleOrNull()
        val qtyVal = s.quantity.toIntOrNull() ?: 1

        repository.createListing(
            title = s.title,
            description = s.description,
            price = priceVal,
            isBarterOnly = s.isBarterOnly,
            isFree = s.isFree,
            acceptHybrid = s.acceptHybrid,
            category = s.category,
            condition = s.condition,
            hostelArea = s.hostelArea,
            quantity = qtyVal,
            imageUris = s.imageUris
        ).onEach { result ->
            when (result) {
                is Resource.Success -> {
                    _state.value = _state.value.copy(isLoading = false, isSuccess = true, error = null)
                }
                is Resource.Error -> {
                    _state.value = _state.value.copy(isLoading = false, error = result.message)
                }
                is Resource.Loading -> {
                    _state.value = _state.value.copy(isLoading = true)
                }
            }
        }.launchIn(viewModelScope)
    }
}
"@

Create-File "feature_listing\presentation\create_listing\CreateListingScreen.kt" @"
package com.cumarket.app.feature_listing.presentation.create_listing

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateListingScreen(
    onNavigateBack: () -> Unit,
    viewModel: CreateListingViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris: List<Uri> ->
        viewModel.onImagesAdded(uris)
    }

    LaunchedEffect(state.isSuccess) {
        if (state.isSuccess) {
            onNavigateBack()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Create Listing") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            OutlinedTextField(
                value = state.title,
                onValueChange = viewModel::onTitleChange,
                label = { Text("Title") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = state.description,
                onValueChange = viewModel::onDescriptionChange,
                label = { Text("Description") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3
            )
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = state.price,
                onValueChange = viewModel::onPriceChange,
                label = { Text("Price") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = state.isFree, onCheckedChange = viewModel::onFreeChange)
                Text("Is Free?")
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = state.isBarterOnly, onCheckedChange = viewModel::onBarterOnlyChange)
                Text("Barter Only?")
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Checkbox(checked = state.acceptHybrid, onCheckedChange = viewModel::onHybridChange)
                Text("Accept Hybrid (Cash + Items)?")
            }

            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = { galleryLauncher.launch("image/*") }) {
                Text("Add Images (\${state.imageUris.size} selected)")
            }

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = viewModel::submitListing,
                modifier = Modifier.fillMaxWidth(),
                enabled = !state.isLoading
            ) {
                if (state.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp))
                } else {
                    Text("Submit Listing")
                }
            }

            if (state.error != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(text = state.error!!, color = MaterialTheme.colorScheme.error)
            }
        }
    }
}
"@
