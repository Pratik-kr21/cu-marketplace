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

Create-File "feature_marketplace\domain\model\Item.kt" @"
package com.cumarket.app.feature_marketplace.domain.model

data class Item(
    val id: String,
    val ownerId: String,
    val title: String,
    val description: String,
    val price: Double?,
    val isBarterOnly: Boolean,
    val isFree: Boolean,
    val acceptHybrid: Boolean,
    val category: String,
    val condition: String,
    val imageUrls: List<String>,
    val hostelArea: String,
    val quantity: Int,
    val isAvailable: Boolean
)
"@

Create-File "feature_marketplace\data\remote\dto\ItemDto.kt" @"
package com.cumarket.app.feature_marketplace.data.remote.dto

import com.cumarket.app.feature_marketplace.domain.model.Item
import com.google.gson.annotations.SerializedName

data class ItemDto(
    @SerializedName("_id") val id: String,
    val userId: String,
    val title: String,
    val description: String,
    val price: Double?,
    val is_barter_only: Boolean,
    val is_free: Boolean,
    val accept_hybrid: Boolean,
    val category: String,
    val condition: String,
    val imageUrls: List<String>,
    val hostel_area: String,
    val quantity: Int,
    val is_available: Boolean,
    val createdAt: String,
    val updatedAt: String
) {
    fun toItem(): Item {
        return Item(
            id = id,
            ownerId = userId,
            title = title,
            description = description,
            price = price,
            isBarterOnly = is_barter_only,
            isFree = is_free,
            acceptHybrid = accept_hybrid,
            category = category,
            condition = condition,
            imageUrls = imageUrls,
            hostelArea = hostel_area,
            quantity = quantity,
            isAvailable = is_available
        )
    }
}
"@

Create-File "feature_marketplace\data\remote\MarketplaceApi.kt" @"
package com.cumarket.app.feature_marketplace.data.remote

import com.cumarket.app.feature_marketplace.data.remote.dto.ItemDto
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface MarketplaceApi {
    @GET("items")
    suspend fun getItems(
        @Query("category") category: String? = null,
        @Query("search") search: String? = null
    ): List<ItemDto>

    @GET("items/{id}")
    suspend fun getItemById(@Path("id") id: String): ItemDto
}
"@

Create-File "feature_marketplace\domain\repository\MarketplaceRepository.kt" @"
package com.cumarket.app.feature_marketplace.domain.repository

import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_marketplace.domain.model.Item
import kotlinx.coroutines.flow.Flow

interface MarketplaceRepository {
    fun getItems(category: String? = null, search: String? = null): Flow<Resource<List<Item>>>
    fun getItemById(id: String): Flow<Resource<Item>>
}
"@

Create-File "feature_marketplace\data\repository\MarketplaceRepositoryImpl.kt" @"
package com.cumarket.app.feature_marketplace.data.repository

import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_marketplace.data.remote.MarketplaceApi
import com.cumarket.app.feature_marketplace.domain.model.Item
import com.cumarket.app.feature_marketplace.domain.repository.MarketplaceRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class MarketplaceRepositoryImpl @Inject constructor(
    private val api: MarketplaceApi
) : MarketplaceRepository {

    override fun getItems(category: String?, search: String?): Flow<Resource<List<Item>>> = flow {
        emit(Resource.Loading())
        try {
            val items = api.getItems(category, search).map { it.toItem() }
            emit(Resource.Success(items))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }

    override fun getItemById(id: String): Flow<Resource<Item>> = flow {
        emit(Resource.Loading())
        try {
            val item = api.getItemById(id).toItem()
            emit(Resource.Success(item))
        } catch (e: HttpException) {
            emit(Resource.Error(e.localizedMessage ?: "An unexpected error occurred"))
        } catch (e: IOException) {
            emit(Resource.Error("Couldn't reach server. Check your internet connection."))
        }
    }
}
"@

Create-File "feature_marketplace\di\MarketplaceModule.kt" @"
package com.cumarket.app.feature_marketplace.di

import com.cumarket.app.feature_marketplace.data.remote.MarketplaceApi
import com.cumarket.app.feature_marketplace.data.repository.MarketplaceRepositoryImpl
import com.cumarket.app.feature_marketplace.domain.repository.MarketplaceRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object MarketplaceModule {

    @Provides
    @Singleton
    fun provideMarketplaceApi(retrofit: Retrofit): MarketplaceApi {
        return retrofit.create(MarketplaceApi::class.java)
    }

    @Provides
    @Singleton
    fun provideMarketplaceRepository(api: MarketplaceApi): MarketplaceRepository {
        return MarketplaceRepositoryImpl(api)
    }
}
"@

Create-File "feature_marketplace\presentation\home\HomeViewModel.kt" @"
package com.cumarket.app.feature_marketplace.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cumarket.app.core.utils.Resource
import com.cumarket.app.feature_marketplace.domain.model.Item
import com.cumarket.app.feature_marketplace.domain.repository.MarketplaceRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import javax.inject.Inject

data class HomeState(
    val items: List<Item> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val search: String = "",
    val category: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: MarketplaceRepository
) : ViewModel() {

    private val _state = MutableStateFlow(HomeState())
    val state: StateFlow<HomeState> = _state.asStateFlow()

    init {
        getItems()
    }

    fun onSearchChange(search: String) {
        _state.value = _state.value.copy(search = search)
        getItems() // Trigger search
    }

    fun onCategorySelect(category: String?) {
        _state.value = _state.value.copy(category = category)
        getItems()
    }

    private fun getItems() {
        val currentSearch = _state.value.search.takeIf { it.isNotBlank() }
        val currentCategory = _state.value.category
        
        repository.getItems(category = currentCategory, search = currentSearch).onEach { result ->
            when (result) {
                is Resource.Success -> {
                    _state.value = _state.value.copy(
                        items = result.data ?: emptyList(),
                        isLoading = false,
                        error = null
                    )
                }
                is Resource.Error -> {
                    _state.value = _state.value.copy(
                        isLoading = false,
                        error = result.message ?: "An unexpected error occurred"
                    )
                }
                is Resource.Loading -> {
                    _state.value = _state.value.copy(isLoading = true)
                }
            }
        }.launchIn(viewModelScope)
    }
}
"@

Create-File "feature_marketplace\presentation\home\HomeScreen.kt" @"
package com.cumarket.app.feature_marketplace.presentation.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.cumarket.app.feature_marketplace.domain.model.Item

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToItemDetail: (String) -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("CU Market", fontWeight = FontWeight.Bold) }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search Bar
            OutlinedTextField(
                value = state.search,
                onValueChange = viewModel::onSearchChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Search items...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                shape = RoundedCornerShape(12.dp)
            )

            // Categories could go here (Horizontal Scroll)

            Box(modifier = Modifier.fillMaxSize()) {
                if (state.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                } else if (state.error != null) {
                    Text(
                        text = state.error!!,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center)
                    )
                } else if (state.items.isEmpty()) {
                    Text(
                        text = "No items found",
                        modifier = Modifier.align(Alignment.Center)
                    )
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(state.items) { item ->
                            ItemCard(item = item, onClick = { onNavigateToItemDetail(item.id) })
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ItemCard(item: Item, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column {
            val imageUrl = if (item.imageUrls.isNotEmpty()) item.imageUrls[0] else ""
            AsyncImage(
                model = imageUrl,
                contentDescription = item.title,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
                    .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp)),
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                val priceText = if (item.isFree) "Free" else if (item.isBarterOnly) "Barter" else "$${item.price}"
                Text(
                    text = priceText,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = item.condition,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
"@
