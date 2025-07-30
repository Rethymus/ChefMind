// ChefMind 智食谱 - 主要JavaScript功能

// PWA 功能初始化
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineDetection();
        this.setupUpdateNotification();
    }

    // 注册 Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker 注册成功:', registration);
                
                // 监听更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker 注册失败:', error);
            }
        }
    }

    // 设置安装提示
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA 安装成功');
            this.hideInstallButton();
        });
    }

    // 显示安装按钮
    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.className = 'pwa-install-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> 安装应用';
        installBtn.onclick = () => this.installApp();
        
        document.body.appendChild(installBtn);
    }

    // 隐藏安装按钮
    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    // 安装应用
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log('安装结果:', outcome);
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }

    // 设置离线检测
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineNotification();
            console.log('网络已连接');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineNotification();
            console.log('网络已断开');
        });

        // 初始状态检查
        if (!this.isOnline) {
            this.showOfflineNotification();
        }
    }

    // 显示离线通知
    showOfflineNotification() {
        const notification = document.createElement('div');
        notification.id = 'offline-notification';
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <i class="fas fa-wifi"></i>
            <span>您当前处于离线状态，部分功能可能受限</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        document.body.appendChild(notification);
    }

    // 隐藏离线通知
    hideOfflineNotification() {
        const notification = document.getElementById('offline-notification');
        if (notification) {
            notification.remove();
        }
    }

    // 显示更新通知
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.className = 'update-notification';
        notification.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>发现新版本，点击更新</span>
            <button onclick="window.location.reload()">更新</button>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        document.body.appendChild(notification);
    }

    // 设置更新通知
    setupUpdateNotification() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }
}

class ChefMind {
    constructor() {
        this.selectedIngredients = [];
        this.selectedMethods = [];
        this.selectedConstraints = {
            time: null,
            people: null,
            difficulty: null,
            taste: null
        };
        this.currentStep = 1;
        this.recipes = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStepIndicator();
        this.updateNextButton();
    }

    bindEvents() {
        // 食材搜索
        document.getElementById('ingredientSearch').addEventListener('input', (e) => {
            this.searchIngredients(e.target.value);
        });

        // 食材选择
        document.querySelectorAll('.ingredient-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.toggleIngredient(e.target.dataset.ingredient);
            });
        });

        // "更多"按钮点击事件
        document.querySelectorAll('.more-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.showMoreIngredients(category);
            });
        });

        // 烹饪方式选择
        document.querySelectorAll('.method-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.toggleMethod(e.currentTarget.dataset.method);
            });
        });

        // 约束条件选择
        document.querySelectorAll('.constraint-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectConstraint(
                    e.target.dataset.constraint,
                    e.target.dataset.value
                );
            });
        });

        // 步骤导航按钮
        document.getElementById('nextStep1').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevStep2').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('nextStep2').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevStep3').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('generateRecipes').addEventListener('click', () => {
            this.generateRecipes();
        });

        document.getElementById('prevStep4').addEventListener('click', () => {
            this.resetToStep1();
        });

        // 模态框控制
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('recipeModal').addEventListener('click', (e) => {
            if (e.target.id === 'recipeModal') {
                this.closeModal();
            }
        });
    }

    // 搜索食材
    searchIngredients(query) {
        const items = document.querySelectorAll('.ingredient-item');
        items.forEach(item => {
            const ingredient = item.dataset.ingredient;
            if (ingredient.includes(query) || query === '') {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // 切换食材选择
    toggleIngredient(ingredient) {
        const index = this.selectedIngredients.indexOf(ingredient);
        const item = document.querySelector(`[data-ingredient="${ingredient}"]`);
        
        if (index > -1) {
            this.selectedIngredients.splice(index, 1);
            item.classList.remove('selected');
        } else {
            this.selectedIngredients.push(ingredient);
            item.classList.add('selected');
        }
        
        this.updateSelectedTags();
        this.updateNextButton();
        this.showIngredientSuggestions();
    }

    // 更新已选食材标签
    updateSelectedTags() {
        const container = document.getElementById('selectedTags');
        container.innerHTML = '';
        
        if (this.selectedIngredients.length === 0) {
            container.innerHTML = '<p style="color: #999; font-style: italic;">请选择食材</p>';
            return;
        }
        
        this.selectedIngredients.forEach(ingredient => {
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                ${ingredient}
                <span class="remove" onclick="chefMind.removeIngredient('${ingredient}')">&times;</span>
            `;
            container.appendChild(tag);
        });
    }

    // 移除食材
    removeIngredient(ingredient) {
        this.toggleIngredient(ingredient);
    }

    // 显示食材搭配建议
    showIngredientSuggestions() {
        if (this.selectedIngredients.length > 0) {
            // 这里可以调用AI API获取食材搭配建议
            console.log('当前选择的食材:', this.selectedIngredients);
            // 实际项目中可以在这里显示AI建议
        }
    }

    // 切换烹饪方式
    toggleMethod(method) {
        const index = this.selectedMethods.indexOf(method);
        const item = document.querySelector(`[data-method="${method}"]`);
        
        if (index > -1) {
            this.selectedMethods.splice(index, 1);
            item.classList.remove('selected');
        } else {
            this.selectedMethods.push(method);
            item.classList.add('selected');
        }
        
        this.updateNextButton();
    }

    // 选择约束条件
    selectConstraint(type, value) {
        // 清除同类型的其他选择
        document.querySelectorAll(`[data-constraint="${type}"]`).forEach(item => {
            item.classList.remove('selected');
        });
        
        // 选择当前项
        document.querySelector(`[data-constraint="${type}"][data-value="${value}"]`).classList.add('selected');
        
        // 更新约束条件
        this.selectedConstraints[type] = value;
        
        console.log('约束条件更新:', this.selectedConstraints);
    }

    // 更新下一步按钮状态
    updateNextButton() {
        const step1Btn = document.getElementById('nextStep1');
        const step2Btn = document.getElementById('nextStep2');
        
        if (step1Btn) {
            step1Btn.disabled = this.selectedIngredients.length === 0;
        }
        
        if (step2Btn) {
            step2Btn.disabled = this.selectedMethods.length === 0;
        }
    }

    // 下一步
    nextStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
            this.updateStepIndicator();
            this.showStep(this.currentStep);
        }
    }

    // 上一步
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepIndicator();
            this.showStep(this.currentStep);
        }
    }

    // 重置到第一步
    resetToStep1() {
        this.currentStep = 1;
        this.updateStepIndicator();
        this.showStep(1);
    }

    // 更新步骤指示器
    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }

    // 显示指定步骤
    showStep(stepNumber) {
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(`step${stepNumber}`).classList.add('active');
    }

    // 生成菜谱
    async generateRecipes() {
        this.currentStep = 4;
        this.updateStepIndicator();
        this.showStep(4);
        
        // 显示加载状态
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('recipeResults').style.display = 'none';
        
        try {
            // 模拟AI生成菜谱（实际项目中调用真实API）
            await this.simulateAIGeneration();
            
            // 隐藏加载状态，显示结果
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('recipeResults').style.display = 'block';
            
            this.displayRecipes();
            
        } catch (error) {
            console.error('生成菜谱失败:', error);
            this.showError('生成菜谱时出现错误，请重试');
        }
    }

    // 模拟AI生成过程
    async simulateAIGeneration() {
        return new Promise(resolve => {
            setTimeout(() => {
                this.recipes = this.generateMockRecipes();
                resolve();
            }, 3000); // 模拟3秒生成时间
        });
    }

    // 生成模拟菜谱数据
    generateMockRecipes() {
        const recipes = [];
        const recipeTemplates = [
            {
                name: '家常炒{ingredient}',
                description: '简单易做的家常菜，营养丰富，口感鲜美',
                time: 20,
                difficulty: 2,
                nutrition: 4,
                servings: '2-3人'
            },
            {
                name: '清蒸{ingredient}',
                description: '保持食材原味，营养不流失，清淡健康',
                time: 25,
                difficulty: 1,
                nutrition: 5,
                servings: '2-3人'
            },
            {
                name: '{ingredient}汤',
                description: '营养丰富的汤品，温暖身心，适合全家享用',
                time: 35,
                difficulty: 2,
                nutrition: 4,
                servings: '3-4人'
            }
        ];

        // 根据选择的食材和烹饪方式生成菜谱
        for (let i = 0; i < Math.min(3, this.selectedMethods.length); i++) {
            const template = recipeTemplates[i];
            const mainIngredient = this.selectedIngredients[0] || '蔬菜';
            
            recipes.push({
                id: i + 1,
                name: template.name.replace('{ingredient}', mainIngredient),
                description: template.description,
                ingredients: this.selectedIngredients.slice(0, 6),
                method: this.selectedMethods[i] || this.selectedMethods[0],
                time: template.time,
                difficulty: template.difficulty,
                nutrition: template.nutrition,
                servings: template.servings,
                steps: this.generateCookingSteps(mainIngredient, this.selectedMethods[i] || this.selectedMethods[0])
            });
        }

        return recipes;
    }

    // 生成烹饪步骤
    generateCookingSteps(ingredient, method) {
        const stepTemplates = {
            '炒': [
                { title: '准备食材', description: `将${ingredient}洗净切好，准备配菜和调料`, tips: '食材切得均匀一些，炒制时受热更均匀' },
                { title: '热锅下油', description: '锅内放油，加热至7成热', tips: '油温不要太高，避免炒糊' },
                { title: '下料炒制', description: `先下${ingredient}大火快炒2-3分钟`, tips: '大火快炒保持食材脆嫩' },
                { title: '调味出锅', description: '加入调料炒匀，即可出锅装盘', tips: '调料要适量，不要掩盖食材本味' }
            ],
            '蒸': [
                { title: '准备蒸具', description: '准备蒸锅，加水烧开', tips: '水量要充足，避免蒸制过程中缺水' },
                { title: '处理食材', description: `将${ingredient}洗净处理，摆放在蒸盘中`, tips: '摆放要整齐，便于受热均匀' },
                { title: '上锅蒸制', description: '大火蒸15-20分钟至熟透', tips: '中途不要开盖，避免影响蒸制效果' },
                { title: '调味装盘', description: '蒸好后淋上调料汁即可', tips: '趁热食用口感最佳' }
            ],
            '煮': [
                { title: '准备汤锅', description: '锅内加适量清水，大火烧开', tips: '水量要充足，根据食材量调整' },
                { title: '下料煮制', description: `将${ingredient}放入开水中煮制`, tips: '先下难熟的食材，再下易熟的' },
                { title: '调味煮透', description: '加入调料，继续煮至食材软烂', tips: '小火慢煮，保持汤汁清澈' },
                { title: '起锅装碗', description: '煮好后盛入碗中即可享用', tips: '可撒些葱花或香菜提味' }
            ]
        };

        return stepTemplates[method] || stepTemplates['炒'];
    }

    // 显示菜谱结果
    displayRecipes() {
        const container = document.getElementById('recipeResults');
        container.innerHTML = '';

        this.recipes.forEach(recipe => {
            const recipeCard = this.createRecipeCard(recipe);
            container.appendChild(recipeCard);
        });
    }

    // 创建菜谱卡片
    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.onclick = () => this.showRecipeDetail(recipe);

        card.innerHTML = `
            <div class="recipe-header">
                <div>
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <p class="recipe-description">${recipe.description}</p>
                </div>
                <div class="recipe-rating">
                    <div class="rating-item">
                        <div class="rating-stars">
                            ${this.generateStars(recipe.difficulty)}
                        </div>
                        <span class="rating-label">难度</span>
                    </div>
                    <div class="rating-item">
                        <div class="rating-stars">
                            ${this.generateStars(recipe.nutrition)}
                        </div>
                        <span class="rating-label">营养</span>
                    </div>
                </div>
            </div>
            
            <div class="recipe-info">
                <div class="info-item">
                    <div class="info-label">烹饪时间</div>
                    <div class="info-value">${recipe.time}分钟</div>
                </div>
                <div class="info-item">
                    <div class="info-label">烹饪方式</div>
                    <div class="info-value">${recipe.method}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">适合人数</div>
                    <div class="info-value">${recipe.servings}</div>
                </div>
            </div>
            
            <div class="recipe-ingredients">
                <h4>主要食材：</h4>
                <div class="ingredients-list">
                    ${recipe.ingredients.map(ing => `<span class="ingredient-chip">${ing}</span>`).join('')}
                </div>
            </div>
            
            <div class="recipe-actions">
                <button class="btn btn-primary" onclick="chefMind.showRecipeDetail(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
                    查看详细步骤
                </button>
                <button class="btn btn-outline" onclick="chefMind.saveRecipe(${recipe.id})">
                    收藏菜谱
                </button>
            </div>
        `;

        return card;
    }

    // 生成星级评分
    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star star"></i>';
            } else {
                stars += '<i class="fas fa-star star empty"></i>';
            }
        }
        return stars;
    }

    // 显示菜谱详情
    showRecipeDetail(recipe) {
        const modal = document.getElementById('recipeModal');
        const title = document.getElementById('modalRecipeTitle');
        const details = document.getElementById('recipeDetails');

        title.textContent = recipe.name;
        
        details.innerHTML = `
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> 菜谱信息</h3>
                <div class="recipe-info">
                    <div class="info-item">
                        <div class="info-label">烹饪时间</div>
                        <div class="info-value">${recipe.time}分钟</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">难度等级</div>
                        <div class="info-value">${this.generateStars(recipe.difficulty)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">营养价值</div>
                        <div class="info-value">${this.generateStars(recipe.nutrition)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">适合人数</div>
                        <div class="info-value">${recipe.servings}</div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-list-ul"></i> 所需食材</h3>
                <div class="ingredients-list">
                    ${recipe.ingredients.map(ing => `<span class="ingredient-chip">${ing}</span>`).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-utensils"></i> 烹饪步骤</h3>
                <ol class="cooking-steps">
                    ${recipe.steps.map(step => `
                        <li class="cooking-step">
                            <div class="step-content">
                                <div class="step-title">${step.title}</div>
                                <div class="step-description">${step.description}</div>
                                ${step.tips ? `<div class="step-tips">💡 小贴士：${step.tips}</div>` : ''}
                            </div>
                        </li>
                    `).join('')}
                </ol>
            </div>
        `;

        // 更新外部链接
        this.updateExternalLinks(recipe.name);
        
        modal.classList.add('active');
    }

    // 更新外部链接
    updateExternalLinks(recipeName) {
        const searchQuery = encodeURIComponent(recipeName + ' 做法');
        
        document.querySelector('.link-btn.bilibili').href = `https://search.bilibili.com/all?keyword=${searchQuery}`;
        document.querySelector('.link-btn.douyin').href = `https://www.douyin.com/search/${searchQuery}`;
        document.querySelector('.link-btn.xiachufang').href = `https://www.xiachufang.com/search/?keyword=${searchQuery}`;
        document.querySelector('.link-btn.xiaohongshu').href = `https://www.xiaohongshu.com/search_result?keyword=${searchQuery}`;
    }

    // 关闭模态框
    closeModal() {
        document.getElementById('recipeModal').classList.remove('active');
    }

    // 收藏菜谱
    saveRecipe(recipeId) {
        // 这里可以实现收藏功能
        alert(`菜谱已收藏！ID: ${recipeId}`);
        console.log('收藏菜谱:', recipeId);
    }

    // 显示错误信息
    // 显示更多食材弹窗
    showMoreIngredients(category) {
        const allVegetables = [
            '白菜', '萝卜', '土豆', '西红柿', '黄瓜', '茄子', '豆角', '青椒', '洋葱', '胡萝卜', 
            '芹菜', '韭菜', '菠菜', '生菜', '西兰花', '花菜', '包菜', '油菜', '小白菜', '娃娃菜',
            '芥蓝', '菜心', '空心菜', '苋菜', '茼蒿', '香菜', '大葱', '小葱', '蒜苗', '韭黄',
            '豆苗', '豌豆', '毛豆', '蚕豆', '冬瓜', '南瓜', '丝瓜', '苦瓜', '节瓜', '莲藕',
            '山药', '芋头', '红薯', '紫薯', '玉米', '竹笋', '蘑菇', '金针菇', '香菇', '平菇'
        ];

        if (category === 'vegetables') {
            this.createMoreIngredientsModal('蔬菜类', allVegetables);
        }
    }

    // 创建更多食材模态框
    createMoreIngredientsModal(categoryName, ingredients) {
        // 创建模态框HTML
        const modalHTML = `
            <div class="modal active" id="moreIngredientsModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>选择${categoryName}</h2>
                        <button class="modal-close" onclick="chefMind.closeMoreIngredientsModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="search-box" style="margin-bottom: 20px;">
                            <i class="fas fa-search"></i>
                            <input type="text" id="moreIngredientsSearch" placeholder="搜索食材名称...">
                        </div>
                        <div class="more-ingredients-grid">
                            ${ingredients.map(ingredient => `
                                <div class="ingredient-item ${this.selectedIngredients.includes(ingredient) ? 'selected' : ''}" 
                                     data-ingredient="${ingredient}"
                                     onclick="chefMind.toggleIngredientInModal('${ingredient}')">
                                    ${ingredient}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="chefMind.closeMoreIngredientsModal()">关闭</button>
                        <button class="btn btn-primary" onclick="chefMind.closeMoreIngredientsModal()">
                            确定 (已选${this.selectedIngredients.length}个)
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 添加到页面
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // 绑定搜索事件
        document.getElementById('moreIngredientsSearch').addEventListener('input', (e) => {
            this.searchMoreIngredients(e.target.value);
        });
    }

    // 在模态框中切换食材选择
    toggleIngredientInModal(ingredient) {
        const index = this.selectedIngredients.indexOf(ingredient);
        const modalItem = document.querySelector(`#moreIngredientsModal [data-ingredient="${ingredient}"]`);
        const mainItem = document.querySelector(`[data-ingredient="${ingredient}"]:not(#moreIngredientsModal [data-ingredient="${ingredient}"])`);
        
        if (index > -1) {
            this.selectedIngredients.splice(index, 1);
            modalItem.classList.remove('selected');
            if (mainItem) mainItem.classList.remove('selected');
        } else {
            this.selectedIngredients.push(ingredient);
            modalItem.classList.add('selected');
            if (mainItem) mainItem.classList.add('selected');
        }
        
        this.updateSelectedTags();
        this.updateNextButton();
        
        // 更新模态框按钮文本
        const confirmBtn = document.querySelector('#moreIngredientsModal .btn-primary');
        if (confirmBtn) {
            confirmBtn.textContent = `确定 (已选${this.selectedIngredients.length}个)`;
        }
    }

    // 搜索更多食材
    searchMoreIngredients(query) {
        const items = document.querySelectorAll('#moreIngredientsModal .ingredient-item');
        items.forEach(item => {
            const ingredient = item.dataset.ingredient;
            if (ingredient.includes(query) || query === '') {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // 关闭更多食材模态框
    closeMoreIngredientsModal() {
        const modal = document.getElementById('moreIngredientsModal');
        if (modal) {
            modal.remove();
        }
    }

    // 显示错误信息
    showError(message) {
        document.getElementById('loadingState').innerHTML = `
            <div style="text-align: center; color: #ff6b6b;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="chefMind.resetToStep1()" style="margin-top: 1rem;">
                    重新开始
                </button>
            </div>
        `;
    }
}

// 初始化应用
let chefMind;
let pwaManager;
document.addEventListener('DOMContentLoaded', () => {
    chefMind = new ChefMind();
    pwaManager = new PWAManager();
});

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 添加一些实用的辅助功能
class RecipeUtils {
    // 营养分析
    static analyzeNutrition(ingredients) {
        const nutritionData = {
            '蔬菜': { calories: 25, protein: 2, carbs: 5, fat: 0.2, fiber: 3 },
            '肉类': { calories: 250, protein: 20, carbs: 0, fat: 18, fiber: 0 },
            '海鲜': { calories: 120, protein: 22, carbs: 0, fat: 2, fiber: 0 },
            '主食': { calories: 130, protein: 3, carbs: 28, fat: 0.5, fiber: 1 }
        };
        
        // 简化的营养计算
        let totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        
        ingredients.forEach(ingredient => {
            // 根据食材类型估算营养
            const category = this.categorizeIngredient(ingredient);
            const nutrition = nutritionData[category] || nutritionData['蔬菜'];
            
            Object.keys(totalNutrition).forEach(key => {
                totalNutrition[key] += nutrition[key];
            });
        });
        
        return totalNutrition;
    }
    
    // 食材分类
    static categorizeIngredient(ingredient) {
        const categories = {
            '蔬菜': ['白菜', '萝卜', '土豆', '西红柿', '黄瓜', '茄子', '豆角', '青椒', '洋葱', '胡萝卜'],
            '肉类': ['猪肉', '牛肉', '鸡肉', '羊肉', '鸭肉', '排骨', '鸡翅', '牛排'],
            '海鲜': ['鱼', '虾', '蟹', '鱿鱼', '带鱼', '扇贝', '海带'],
            '主食': ['米饭', '面条', '饺子皮', '面包', '馒头', '年糕']
        };
        
        for (const [category, items] of Object.entries(categories)) {
            if (items.includes(ingredient)) {
                return category;
            }
        }
        
        return '蔬菜'; // 默认分类
    }
    
    // 时间估算
    static estimateCookingTime(ingredients, method, difficulty) {
        const baseTime = {
            '炒': 15,
            '煮': 25,
            '蒸': 20,
            '烤': 35,
            '炸': 20,
            '炖': 45,
            '凉拌': 10,
            '焖': 30
        };
        
        let time = baseTime[method] || 20;
        
        // 根据食材数量调整时间
        time += ingredients.length * 2;
        
        // 根据难度调整时间
        time += (difficulty - 1) * 10;
        
        return Math.max(10, time); // 最少10分钟
    }
}

// 导出给全局使用
window.ChefMind = ChefMind;
window.RecipeUtils = RecipeUtils;