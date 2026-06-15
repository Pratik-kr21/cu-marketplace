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

Create-File "feature_marketplace\presentation\item_detail\ItemDetailViewModel.kt" @"
package com.cumarket.app.feature_marketplace.presentation.item_detail

import androidx.lifecycle.SavedStateHandle
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

data class ItemDetailState(
    val item: Item? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ItemDetailViewModel @Inject constructor(
    private val repository: MarketplaceRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _state = MutableStateFlow(ItemDetailState())
    val state: StateFlow<ItemDetailState> = _state.asStateFlow()

    init {
        savedStateHandle.get<String>("itemId")?.let { itemId ->
            getItem(itemId)
        }
    }

    private fun getItem(itemId: String) {
        repository.getItemById(itemId).onEach { result ->
            when (result) {
                is Resource.Success -> {
                    _state.value = ItemDetailState(item = result.data)
                }
                is Resource.Error -> {
                    _state.value = ItemDetailState(error = result.message ?: "An unexpected error occurred")
                }
                is Resource.Loading -> {
                    _state.value = ItemDetailState(isLoading = true)
                }
            }
        }.launchIn(viewModelScope)
    }
}
"@

Create-File "feature_marketplace\presentation\item_detail\ItemDetailScreen.kt" @"
package com.cumarket.app.feature_marketplace.presentation.item_detail

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemDetailScreen(
    onNavigateBack: () -> Unit,
    onNavigateToChat: (String) -> Unit,
    viewModel: ItemDetailViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Item Details") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            } else if (state.error != null) {
                Text(
                    text = state.error!!,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.align(Alignment.Center)
                )
            } else if (state.item != null) {
                val item = state.item!!
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                ) {
                    val imageUrl = if (item.imageUrls.isNotEmpty()) item.imageUrls[0] else ""
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = item.title,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(300.dp),
                        contentScale = ContentScale.Crop
                    )
                    
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = item.title,
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        val priceText = if (item.isFree) "Free" else if (item.isBarterOnly) "Barter" else "$${item.price}"
                        Text(
                            text = priceText,
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(text = "Condition: \${item.condition}", style = MaterialTheme.typography.bodyLarge)
                        Text(text = "Category: \${item.category}", style = MaterialTheme.typography.bodyLarge)
                        Text(text = "Available: \${if (item.isAvailable) "Yes" else "No"}", style = MaterialTheme.typography.bodyLarge)
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text(text = "Description", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = item.description, style = MaterialTheme.typography.bodyMedium)
                        
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        Button(
                            onClick = { onNavigateToChat(item.ownerId) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Message Seller")
                        }
                    }
                }
            }
        }
    }
}
"@
