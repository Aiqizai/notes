<template>
  <div class="app-container">
    <div v-if="pageShow" class="dataTablePage">
      <!--控件部分-->
      <div id="dataTableToolbar">
        <!--选择平台店铺-->
        <div id="platform">
          <span>平台：</span>
          <ul>
            <li
              v-for="(v, i) in platforms"
              :key="i"
              :class="v.checked"
              @click="changePlatform(i)"
            >
              <span>{{ v.text }}</span>
            </li>
          </ul>
        </div>
        <div class="div-hr" />
        <!--搜索类型-->
        <div id="searchType">
          <div v-if="['shopee', 'amazon'].includes(platforms[platform].value)" style="display: inline-block">
            <span v-if="platforms[platform].value !== 'shopee'">搜索类型：</span>
            <ul v-if="platforms[platform].value !== 'shopee'">
              <li
                v-for="(v, i) in searchTypes"
                :key="i"
                :class="v.checked"
                @click="changeSearchType(i)"
              >
                <span>{{ v.text }}</span>
              </li>
            </ul>
          </div>
          <span>&nbsp;&nbsp;店铺负责人：</span>
          <el-select
            v-model="staffId"
            placeholder="请选择店铺负责人"
            clearable
            filterable
            size="small"
          >
            <el-option
              v-for="v in staffIds"
              :key="v.value"
              :value="v.value"
              :label="v.text"
            />
          </el-select>
          <template v-if="!['shopee', 'amazon'].includes(platforms[platform].value)">
            <span>&nbsp;令牌是否有效：</span>
            <el-select v-model="isTokenValid" placeholder="请选择" clearable filterable size="small">
              <el-option
                v-for="v in tokenValid"
                :key="v.value"
                :value="v.value"
                :label="v.label"
              />
            </el-select>
          </template>
          <div v-if="!['shopee', 'amazon'].includes(platforms[platform].value)" class="div-hr" />
          <div v-if="platforms[platform].value=='shopee'" class="div-hr" />
          <template v-if="platforms[platform].value == 'amazon'">
            <el-select
              v-model="amazonAreaCheck"
              filterable
              size="small"
              style="width: 100px"
            >
              <el-option
                v-for="v in amazonArea"
                :key="v.value"
                :value="v.value"
                :label="v.label"
              />
            </el-select>
          </template>
        </div>
        <!-- YuammeiShop/list 接口查询参数 -->
        <div v-if="!['shopee', 'amazon'].includes(platforms[platform].value)">
          <span>&nbsp;店铺分组：</span>
          <el-input
            v-model="shopGroup"
            placeholder="请输入查询的内容..."
            max-length="255"
            size="small"
            clearable
            style="width: 260px"
          />
          <span>&nbsp;店铺名称：</span>
          <el-input
            v-model="shopName"
            placeholder="请输入查询的内容..."
            max-length="255"
            size="small"
            clearable
            style="width: 260px"
          />
          <span>&nbsp;店铺序号：</span>
          <el-input
            v-model="shopNumber"
            placeholder="请输入查询的内容..."
            max-length="255"
            size="small"
            clearable
            style="width: 260px"
          />
          <el-button type="success" size="small" @click="search">综合查询</el-button>
        </div>
        <div v-if="platforms[platform].value !== 'shopee'" class="div-hr" />
        <!--搜索与操作-->
        <div class="searchAndAction">
          <div id="search">
            <!--搜索名称-->
            <div v-if="['shopee', 'amazon'].includes(platforms[platform].value)">搜索名称:</div>
            <el-input
              v-if="['shopee', 'amazon'].includes(platforms[platform].value)"
              v-model="searchText"
              placeholder="请输入查询的内容..."
              max-length="255"
              size="small"
              clearable
              style="width: 260px"
            />
            <el-select
              v-if="platforms[platform].value === 'shopee'"
              v-model="searchName"
              placeholder="请选择"
              size="small"
            >
              <el-option v-for="item in shopeeCountry" :key="item.label" :value="item.value" :label="item.label" />
            </el-select>
            <el-button
              v-if="['shopee', 'amazon'].includes(platforms[platform].value)"
              type="success"
              size="small"
              @click="search"
            >综合查询</el-button>
            <!--操作-->
            <div id="action">
              <el-button
                v-if="platforms[platform].value !== 'kaufland'"
                type="success"
                size="small"
                @click="editsBtn()"
              >批量修改</el-button>
              <el-button
                type="success"
                size="small"
                @click="add('create', 0)"
              >增加</el-button>
              <el-button
                type="success"
                size="small"
                @click="testMethod"
              >测试</el-button>
              <!--                        <el-button type="danger" size="small" @click="del">删除</el-button>-->
            </div>
          </div>
        </div>
      </div>
      <render-dialog
        :stafflist="staffIds"
        :dialog-visible="dialogVisible"
        :platform="platforms[platform].text"
        @closeShopMsg="closeShopMsg"
      />
      <!--数据部分-->
      <el-table
        :data="tableData"
        tooltip-effect="dark"
        :height="tableHeight"
        border
        style="width: 100%"
        @selection-change="getSelectedValue"
      >
        <el-table-column type="selection" min-width="2%" align="center" />
        <el-table-column
          v-for="(item, index) in columnsData"
          :key="index"
          :label="item.title"
          :align="item.align"
          min-width="50%"
        >
          <template slot-scope="scope">
            <el-tooltip v-if="item.field === 'isExpired'" placement="top" effect="light">
              <div slot="content">
                <p>最后校验信息 ：<span>{{ scope.row.lastValidMessage }}</span></p>
              </div>
              <p class="isExpired">
                是否有效: <span :style="{color: scope.row.isTokenValid ? 'green' : 'red'}">{{ scope.row.isTokenValid ? '有效' : '无效' }}</span><br>
                最后校验时间：<span>{{ scope.row.lastValidTime }}</span><br>
                最后校验信息 ：<span>{{ scope.row.lastValidMessage }}</span>
              </p>
            </el-tooltip>
            <span v-else v-html="formatterColumn(scope.row[item.field], item.field)">{{ scope.row[item.field] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="50%" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              @click="add('edit', scope.$index)"
            >编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          :current-page.sync="currentPage"
          :page-sizes="pageList"
          background
          layout="total,sizes,prev,pager,next,jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      <!--删除弹出框-->
      <el-dialog
        id="del"
        title="删除店铺"
        :visible.sync="delDialog"
        width="30%"
        :close-on-click-modal="false"
      >
        <div class="modal-body">
          <span>该操作将删除绑定的店铺，这将是一个不可逆的过程，同时删除店铺管理的所有数据</span>
          <span style="color: red">请谨慎操作</span>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="deldialog = false">取 消</el-button>
          <el-button type="primary" @click="deleteShop">确 定</el-button>
        </span>
      </el-dialog>
      <!--新增弹出框-->
      <el-dialog
        title="店铺信息"
        :visible.sync="amazonDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>国家：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="amazonShop.country"
                placeholder="请选择"
                size="small"
                class="select"
              >
                <el-option value="CA" label="[CA] 加拿大" />
                <el-option value="US" label="[US] 美国" />
                <el-option value="MX" label="[MX] 墨西哥" />
                <el-option value="DE" label="[DE] 德国" />
                <el-option value="ES" label="[ES] 西班牙" />
                <el-option value="FR" label="[FR] 法国" />
                <el-option value="PL" label="[PL] 波兰" />
                <el-option value="SE" label="[SE] 瑞典" />
                <el-option value="IN" label="[IN] 印度" />
                <el-option value="IT" label="[IT] 意大利" />
                <el-option value="UK" label="[UK] 英国" />
                <el-option value="NL" label="[NL] 荷兰" />
                <el-option value="JP" label="[JP] 日本" />
                <el-option value="CN" label="[CN] 中国(大陆地区)" />
                <el-option value="AU" label="[AU] 澳大利亚" />
                <el-option value="BR" label="[BR] 巴西" />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label class="label">币种：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="amazonShop.currency"
                placeholder="请选择币种"
                size="small"
                class="select"
              >
                <el-option value="RMB" label="RMB" />
                <el-option value="AUD" label="AUD" />
                <el-option value="CAD" label="CAD" />
                <el-option value="EUR" label="EUR" />
                <el-option value="GBP" label="GBP" />
                <el-option value="HKD" label="HKD" />
                <el-option value="IDR" label="IDR" />
                <el-option value="INR" label="INR" />
                <el-option value="JPY" label="JPY" />
                <el-option value="MYR" label="MYR" />
                <el-option value="PHP" label="PHP" />
                <el-option value="SGD" label="SGD" />
                <el-option value="THB" label="THB" />
                <el-option value="TWD" label="TWD" />
                <el-option value="USD" label="USD" />
                <el-option value="MXN" label="MXN" />
              </el-select>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>业绩维护线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.minSaleVolume"
                size="small"
                placeholder="请填写业绩维护线"
                @keyup.native="inputLimit('minSaleVolume')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>利润提成线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.profitCurveLine"
                size="small"
                placeholder="请填写利润提成线"
                @keyup.native="inputLimit('profitCurveLine')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <div class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>卖家编号：</label>
              </div>
              <div class="inp">
                <el-input
                  id="sellerNumber"
                  v-model="amazonShop.sellerNumber"
                  size="small"
                />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>令牌：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="amazonShop.amazonToken"
                  size="small"
                />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>说明：</label>
              </div>
              <div>
                <label style="white-space: nowrap">
                  欧洲五国和印度 开发者ID 290084201542
                </label>
                <p style="margin: 5px 0">美国 开发者ID 581811610737</p>
                <p style="margin: 5px 0">日本 新加坡 开发者ID 202335731912</p>
              </div>
            </el-col>
            <el-col :span="12" class="cols" />
          </el-row>
        </div>
        <div class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >广告API授权</el-button>
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <span :style="{ color: shop.message.color }" class="message">{{
                  shop.message.text
                }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="joomDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>佣金比例：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="joomShop.commissionRate"
                size="small"
                placeholder="请输入大于0小于1的小数"
                @blur="oninput($event)"
              />
              <el-tooltip
                class="item commissionTips"
                effect="dark"
                :content="commissionRateTips"
                placement="bottom"
              >
                <span><i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>站点：</label>
            </div>
            <div class="inp">
              <el-select v-model="joomShop.siteId" :disabled="joomShop.disabled" placeholder="请选择" size="small" class="select">
                <el-option
                  v-for="item in joomShop.shopSite"
                  :key="item.siteId"
                  :value="item.siteId"
                  :label="item.siteName"
                />
              </el-select>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺组：</label>
            </div>
            <div class="inp">
              <el-input v-model="joomShop.shopGroup" placeholder="请填写店铺店铺组" size="small" />
              <el-tooltip
                class="item commissionTips"
                effect="dark"
                :content="shopGroupTips"
                placement="bottom"
              >
                <span><i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <div v-if="shop.shopAPI" class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Id：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Redirect URI：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.RedirectURI" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >API授权</el-button>
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <span :style="{ color: shop.message.color }" class="message">{{
                  shop.message.text
                }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="lazadaDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>国家：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="lazadaShop.country"
                placeholder="请选择国家"
                size="small"
                class="select"
                :multiple="isMultiple"
                collapse-tags
                @change="changeValue"
              >
                <el-option
                  v-for="item in allCountry"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="
                    item.value == 'CB' && isMultiple == false ? '' : false
                  "
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>币种：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="lazadaShop.currency"
                placeholder="请选择"
                size="small"
                class="select"
                :disabled="isDisabled"
              >
                <el-option value="RMB" label="RMB" />
                <el-option value="AUD" label="AUD" />
                <el-option value="CAD" label="CAD" />
                <el-option value="EUR" label="EUR" />
                <el-option value="GBP" label="GBP" />
                <el-option value="HKD" label="HKD" />
                <el-option value="IDR" label="IDR" />
                <el-option value="INR" label="INR" />
                <el-option value="JPY" label="JPY" />
                <el-option value="MYR" label="MYR" />
                <el-option value="PHP" label="PHP" />
                <el-option value="SGD" label="SGD" />
                <el-option value="THB" label="THB" />
                <el-option value="TWD" label="TWD" />
                <el-option value="USD" label="USD" />
              </el-select>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>业绩维护线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.minSaleVolume"
                size="small"
                placeholder="请填写业绩维护线"
                @keyup.native="inputLimit('minSaleVolume')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>利润提成线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.profitCurveLine"
                size="small"
                placeholder="请填写利润提成线"
                @keyup.native="inputLimit('profitCurveLine')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
          <el-col
            v-if="platforms[platform].value == 'wish'"
            :span="12"
            class="cols"
          >
            <div>
              <label>是否包含手机壳：</label>
            </div>
            <div>
              <input
                v-model="shop.isPhone"
                type="checkbox"
                class="form-control"
                style="width: 16px; border-color: #fff; box-shadow: inset 0 0 0"
              >
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div>
              <el-button
                type="success"
                size="small"
                @click="open_access_window"
              >API授权</el-button>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div>
              <span :style="{ color: shop.message.color }" class="message">{{
                shop.message.text
              }}</span>
            </div>
          </el-col>
        </el-row>
        <div v-if="shop.shopAPI" class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Id：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Redirect URI：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.RedirectURI" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>商铺后缀：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.Suffix" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >API授权</el-button>
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <span :style="{ color: shop.message.color }" class="message">{{
                  shop.message.text
                }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="allegroDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>佣金比例：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="allegroShop.commissionRate"
                size="small"
                placeholder="请输入大于0小于1的小数"
                @blur="oninput($event)"
              />
              <el-tooltip class="item commissionTips" effect="dark" :content="commissionRateTips" placement="bottom">
                <span><i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>站点：</label>
            </div>
            <div class="inp">
              <el-select v-model="allegroShop.siteId" :disabled="allegroShop.disabled" placeholder="请选择" size="small" class="select">
                <el-option
                  v-for="item in allegroShop.shopSite"
                  :key="item.siteId"
                  :value="item.siteId"
                  :label="item.siteName"
                />
              </el-select>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div>
              <el-button
                type="success"
                size="small"
                @click="open_access_window"
              >API授权</el-button>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div>
              <span :style="{ color: shop.message.color }" class="message">{{
                shop.message.text
              }}</span>
            </div>
          </el-col>
        </el-row>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="b2wDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>负责人：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>API令牌：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="b2wShop.apiToken"
                placeholder="请填写API令牌"
                size="small"
              />
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>用户邮箱：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="b2wShop.userName"
                placeholder="请填写用户邮箱"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>佣金比例：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="b2wShop.commissionRate"
                size="small"
                placeholder="请输入大于0小于1的小数"
                @blur="oninput($event)"
              />
              <el-tooltip class="item commissionTips" effect="dark" :content="commissionRateTips" placement="bottom">
                <span><i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16" class="cols" style="position: relative">
            <!--                    <div class="label">-->
            <!--                        <label>X_ACCOUNTMANAGER_KEY：</label>-->
            <!--                    </div>-->
            <span
              style="line-height: 32px; height: 32px"
            >X_ACCOUNTMANAGER_KEY：</span>
            <div class="inp">
              <el-input
                v-model="b2wShop.xaccountmanagerKey"
                placeholder="请填写X_ACCOUNTMANAGER_KEY"
                size="small"
                style="width: 200px"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="mallDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>利润率：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="mallShop.profit"
                size="small"
                placeholder="请填写利润率"
              />
            </div>
          </el-col>
          <el-col :span="12" class="cols" />
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>业绩维护线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.minSaleVolume"
                size="small"
                placeholder="请填写业绩维护线"
                @keyup.native="inputLimit('minSaleVolume')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>利润提成线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.profitCurveLine"
                size="small"
                placeholder="请填写利润提成线"
                @keyup.native="inputLimit('profitCurveLine')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺账号：</label>
            </div>
            <div class="inp">
              <el-input
                id="shopUserName"
                v-model="mallShop.shopUserName"
                size="small"
                placeholder="请填写店铺账号"
              />
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺密码：</label>
            </div>
            <div class="inp">
              <el-input
                id="shopPassword"
                v-model="mallShop.shopPassword"
                size="small"
                placeholder="请填写店铺密码"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>Client Id：</label>
            </div>
            <div class="inp">
              <el-input v-model="shop.ClientId" size="small" />
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>Client Secret：</label>
            </div>
            <div class="inp">
              <el-input v-model="shop.ClientSecret" size="small" />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <div v-if="shop.shopAPI" class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Id：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Redirect URI：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.RedirectURI" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>商铺后缀：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.Suffix" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >API授权</el-button>
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <span :style="{ color: shop.message.color }" class="message">{{
                  shop.message.text
                }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="shopeeDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row style="padding-left: 5px">
          <el-radio
            v-model="shopeeShopType"
            label="0"
            :disabled="typeDisabled"
          >主站点</el-radio>
          <el-radio
            v-model="shopeeShopType"
            label="1"
            :disabled="typeDisabled"
          >子站点</el-radio>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺站点：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shopeeShop.shopSite"
                placeholder="请选择"
                size="small"
                class="select"
              >
                <el-option value="SG" label="新加坡" />
                <el-option value="MY" label="马来" />
                <el-option value="ID" label="印尼" />
                <el-option value="PH" label="菲律宾" />
                <el-option value="TH" label="泰国" />
                <el-option value="TW" label="台湾" />
                <el-option value="VN" label="越南" />
                <el-option value="BR" label="巴西" />
              </el-select>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>利润率：</label>
            </div>
            <div class="inp">
              <el-input
                id="joomProfit"
                v-model="shopeeShop.profit"
                size="small"
                placeholder="请填写利润率"
              />
            </div>
          </el-col>
          <el-col v-if="shopeeShopType == '1'" :span="12" class="cols">
            <div class="label">
              <label>shopee主账号:</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shopeeMainShop"
                placeholder="请选择shopee主账号"
                filterable
                size="small"
                class="select"
                clearable
              >
                <el-option
                  v-for="(v, i) in shopeeMainShopList"
                  :key="i"
                  :value="v.value"
                  :label="v.label"
                />
              </el-select>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>业绩维护线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.minSaleVolume"
                size="small"
                placeholder="请填写业绩维护线"
                @keyup.native="inputLimit('minSaleVolume')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>利润提成线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.profitCurveLine"
                size="small"
                placeholder="请填写利润提成线"
                @keyup.native="inputLimit('profitCurveLine')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <div v-if="shop.shopAPI" class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Id：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Redirect URI：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.RedirectURI" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>商铺后缀：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.Suffix" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >API授权</el-button>
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <span :style="{ color: shop.message.color }" class="message">{{
                  shop.message.text
                }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-if="shopeeShop.shopAPIShopee" class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>shopid：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="shopeeShop.shopIDShopee"
                  size="small"
                  name="shopid"
                />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>partner_Id：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="shopeeShop.partnerIdShopee"
                  size="small"
                  name="partnerId"
                />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>secret_Key：</label>
              </div>
              <div class="inp">
                <el-input v-model="shopeeShop.secretKey" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols" />
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >获取shopId</el-button>
              </div>
            </el-col>
            <el-col :span="12" class="cols" />
          </el-row>
        </div>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="wishDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>佣金比例：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="wishShop.commissionRate"
                size="small"
                placeholder="请输入大于0小于1的小数"
                @blur="oninput($event)"
              />
              <el-tooltip
                class="item commissionTips"
                effect="dark"
                :content="commissionRateTips"
                placement="bottom"
              >
                <span><i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>站点：</label>
            </div>
            <div class="inp">
              <el-select v-model="wishShop.siteId" :disabled="wishShop.disabled" placeholder="请选择" size="small" class="select">
                <el-option
                  v-for="item in wishShop.shopSite"
                  :key="item.siteId"
                  :value="item.siteId"
                  :label="item.siteName"
                />
              </el-select>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <div v-if="shop.shopAPI" class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Id：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Redirect URI：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.RedirectURI" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >API授权</el-button>
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <span :style="{ color: shop.message.color }" class="message">{{
                  shop.message.text
                }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-if="shop.shopAPIShopee" class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>shopid：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="shop.shopIDShopee"
                  size="small"
                  name="shopid"
                />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>partner_Id：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="shop.partnerIdShopee"
                  size="small"
                  name="partnerId"
                />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>secret_Key：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.secretKey" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols" />
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >获取shopId</el-button>
              </div>
            </el-col>
            <el-col :span="12" class="cols" />
          </el-row>
        </div>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="aliexpressDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>业绩维护线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.minSaleVolume"
                size="small"
                placeholder="请填写业绩维护线"
                @keyup.native="inputLimit('minSaleVolume')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>利润提成线：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.profitCurveLine"
                size="small"
                placeholder="请填写利润提成线"
                @keyup.native="inputLimit('profitCurveLine')"
                @blur="checkInput($event)"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>基准最小利润：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="wishShop.minProfit"
                size="small"
                placeholder="请填写基准最小利润"
              />
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>基准利润率：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="wishShop.profitRatio"
                size="small"
                placeholder="请填写基准利润率"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>令牌</label>
            </div>
            <div class="inp">
              <el-input
                v-model="amazonShop.amazonToken"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
        <div v-if="shop.shopAPIShopee" class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>shopid：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="shop.shopIDShopee"
                  size="small"
                  name="shopid"
                />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>partner_Id：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="shop.partnerIdShopee"
                  size="small"
                  name="partnerId"
                />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>secret_Key：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.secretKey" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols" />
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >获取shopId</el-button>
              </div>
            </el-col>
            <el-col :span="12" class="cols" />
          </el-row>
        </div>
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="mercadoDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺管理员"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>佣金比例：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="mercadoShop.commissionRate"
                size="small"
                placeholder="请输入大于0小于1的小数"
                @blur="oninput($event)"
              />
              <el-tooltip class="item commissionTips" effect="dark" :content="commissionRateTips" placement="bottom">
                <span><i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <div v-if="shop.shopAPI" class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Id：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Redirect URI：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="shop.RedirectURI"
                  :disabled="true"
                  size="small"
                />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>&nbsp;</label>
              </div>
              <div>
                <el-button
                  type="success"
                  size="small"
                  @click="open_access_window"
                >API授权</el-button>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <span :style="{ color: shop.message.color }" class="message">{{
                  shop.message.text
                }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="kauflandDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute; top: 31px; left: 105px">{{
              shop.errorMsg
            }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.name"
                placeholder="请填写店铺名称"
                size="small"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺负责人"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v, i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>佣金比例：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="kauflandShop.commissionRate"
                size="small"
                placeholder="请输入大于0小于1的小数"
                @blur="oninput($event)"
              />
              <el-tooltip class="item commissionTips" effect="dark" :content="commissionRateTips" placement="bottom">
                <span><i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button
                type="success"
                size="small"
                @click="save"
              >保存</el-button>
            </div>
          </el-col>
        </el-row>
        <!-- v-if="shop.shopAPI" -->
        <div class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Id：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Redirect URI：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.RedirectURI" size="small" />
              </div>
            </el-col>
            <!--                    <el-col :span="12" class="cols">-->
            <!--                        <div class="label">-->
            <!--                            <label>&nbsp;</label>-->
            <!--                        </div>-->
            <!--                        <div>-->
            <!--                            <el-button type="success" size="small" @click="open_access_window">API授权</el-button>-->
            <!--                        </div>-->
            <!--                    </el-col>-->
          </el-row>
          <!--                <el-row>-->
          <!--                    <el-col :span="12" class="cols">-->
          <!--                        <div class="label">-->
          <!--                            <span :style="{color:shop.message.color}" class="message">{{ shop.message.text }}</span>-->
          <!--                        </div>-->
          <!--                    </el-col>-->
          <!--                </el-row>-->
        </div>
        <!--  排除员工  -->
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="walmartDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute;top: 31px; left: 105px;">{{ shop.errorMsg }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input v-model="shop.name" placeholder="请填写店铺名称" size="small" />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺负责人"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v,i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                          v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>佣金比例：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="walmartShop.commissionRate"
                size="small"
                placeholder="请输入大于0小于1的小数"
                @blur="oninput($event)"
              />
              <el-tooltip class="item commissionTips" effect="dark" :content="commissionRateTips" placement="bottom">
                <span><i class="el-icon-info" /></span>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button type="success" size="small" @click="save">保存</el-button>
            </div>
          </el-col>
        </el-row>
        <!-- v-if="shop.shopAPI" -->
        <div class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Id：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
        </div>
        <!--  排除员工  -->
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="coupangDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute;top: 31px; left: 105px;">{{ shop.errorMsg }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input v-model="shop.name" placeholder="请填写店铺名称" size="small" />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺管理员：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺负责人"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v,i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button type="success" size="small" @click="save">保存</el-button>
            </div>
          </el-col>
        </el-row>
        <!-- v-if="shop.shopAPI" -->
        <div class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Id：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>卖家ID：</label>
              </div>
              <div class="inp">
                <el-input v-model="coupangShop.sellerNumber" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>佣金比例：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="coupangShop.commissionRate"
                  size="small"
                  placeholder="请输入大于0小于1的小数"
                  @blur="oninput($event)"
                />
                <el-tooltip class="item commissionTips" effect="dark" :content="commissionRateTips" placement="bottom">
                  <span><i class="el-icon-info" /></span>
                </el-tooltip>
              </div>
            </el-col>
          </el-row>
        </div>
        <!--  排除员工  -->
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog
        title="店铺信息"
        :visible.sync="linioDialog"
        width="40%"
        :close-on-click-modal="false"
        :before-close="closeDialog"
      >
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute;top: 31px; left: 105px;">{{ shop.errorMsg }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input v-model="shop.name" placeholder="请填写店铺名称" size="small" />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺负责人：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺负责人"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v,i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <!-- <input  placeholder="请选择店铺交接时间" id="shopTime"
                              v-model="shop.time" readonly="readonly"> -->
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button type="success" size="small" @click="save">保存</el-button>
            </div>
          </el-col>
        </el-row>
        <!-- v-if="shop.shopAPI" -->
        <div class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>userName：</label>
              </div>
              <div class="inp">
                <el-input v-model="linioShop.userName" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>Client Secret：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>站点：</label>
              </div>
              <div class="inp">
                <el-select v-model="linioShop.siteId" :disabled="linioShop.disabled" placeholder="请选择" size="small" class="select">
                  <el-option
                    v-for="item in linioShop.shopSite"
                    :key="item.siteId"
                    :value="item.siteId"
                    :label="item.siteName"
                  />
                </el-select>
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>佣金比例：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="linioShop.commissionRate"
                  size="small"
                  placeholder="请输入大于0小于1的小数"
                  @blur="oninput($event)"
                />
                <el-tooltip class="item commissionTips" effect="dark" :content="commissionRateTips" placement="bottom">
                  <span><i class="el-icon-info" /></span>
                </el-tooltip>
              </div>
            </el-col>
          </el-row>
        </div>
        <!--  排除员工  -->
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <el-dialog title="店铺信息" :visible.sync="cdiscountDialog" width="40%" :close-on-click-modal="false">
        <el-row>
          <el-col :span="12" class="cols" style="position: relative">
            <div class="label">
              <label>店铺序号：</label>
            </div>
            <div class="inp">
              <el-input
                v-model="shop.number"
                placeholder="请填写店铺序号"
                size="small"
                @change="checkShopNumber"
              />
            </div>
            <label style="position: absolute;top: 31px; left: 105px;">{{ shop.errorMsg }}</label>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺名称：</label>
            </div>
            <div class="inp">
              <el-input v-model="shop.name" placeholder="请填写店铺名称" size="small" />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺负责人：</label>
            </div>
            <div class="inp">
              <el-select
                v-model="shop.shopAdmin"
                placeholder="请选择店铺负责人"
                filterable
                size="small"
                class="select"
              >
                <el-option
                  v-for="(v,i) in staffIds"
                  :key="i"
                  :value="v.value"
                  :label="v.text"
                />
              </el-select>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>店铺交接时间：</label>
            </div>
            <div class="inp">
              <el-date-picker
                v-model="shop.time"
                size="small"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择店铺交接时间"
              />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div class="inp">
              <el-button type="success" size="small" @click="save">保存</el-button>
            </div>
          </el-col>
          <el-col :span="12" class="cols">
            <div class="label">
              <label>&nbsp;</label>
            </div>
            <div>
              <el-button type="success" size="small" @click="get_access_token('cdiscount')">API授权</el-button>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" class="cols" />
          <el-col :span="12" class="cols">
            <div>
              <span :style="{color:shop.message.color}" class="message">{{ shop.message.text }}</span>
            </div>
          </el-col>
        </el-row>
        <!-- v-if="shop.shopAPI" -->
        <div class="token">
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>API账号：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientId" size="small" />
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>API密码：</label>
              </div>
              <div class="inp">
                <el-input v-model="shop.ClientSecret" size="small" />
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>站点：</label>
              </div>
              <div class="inp">
                <el-select v-model="cdiscountShop.siteId" :disabled="cdiscountShop.disabled" placeholder="请选择" size="small" class="select">
                  <el-option
                    v-for="item in cdiscountShop.shopSite"
                    :key="item.siteId"
                    :value="item.siteId"
                    :label="item.siteName"
                  />
                </el-select>
              </div>
            </el-col>
            <el-col :span="12" class="cols">
              <div class="label">
                <label>佣金比例：</label>
              </div>
              <div class="inp">
                <el-input
                  v-model="cdiscountShop.commissionRate"
                  size="small"
                  placeholder="请输入大于0小于1的小数"
                  @blur="oninput($event)"
                />
                <el-tooltip class="item commissionTips" effect="dark" :content="commissionRateTips" placement="bottom">
                  <span><i class="el-icon-info" /></span>
                </el-tooltip>
              </div>
            </el-col>
          </el-row>
        </div>
        <!--  排除员工  -->
        <exclude-staff
          v-if="isAddOrEdit"
          :id="shop.id"
          :stafflist="staffIds"
          :platform="currentPlatForm"
          :shopadmin="shop.shopAdmin"
          :excludedata="StaffExcludeData"
          @refreshExclude="refreshExclude"
        />
      </el-dialog>
      <!--iframe-->
      <!-- 模态框 -->
      <el-dialog
        title="授权窗口"
        :visible.sync="iframedialog"
        width="45%"
        :close-on-click-modal="false"
      >
        <div class="modal-body" style="width: 100%; height: 500px">
          <iframe
            id="iframe"
            name="myframe"
            width="100%"
            height="100%"
            frameborder="0"
            :src="frameSrc"
          />
        </div>
      </el-dialog>

      <!-- 批量修改 -->
      <batch-modify
        :staff-ids="staffIds"
        :checkdata="row"
        :platform="platforms[platform]"
        :edits-dialog="editsDialog"
        @closeEditDialog="closeEditDialog"
      />
    </div>
    <div v-else>
      <h1 style="margin: 20px">该账号没有绑定店铺, 请联系管理员添加店铺!</h1>
    </div>
  </div>
</template>

<script>
const format = (fmt) => {
  const o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }

  return fmt
}

// 屏幕缩放
// window.onresize = function () {
//     vue.search();
// };

const submit_Form = (url, method, target, data) => {
  // 创建Form
  // const form = $("<form></form>");
  const form = document.createElement('form')
  // 设置属性
  form.setAttribute('action', url)
  form.setAttribute('method', method)
  form.setAttribute('target', target)
  for (const key in data) {
    // 创建Input
    // const my_input = $('<input  name="' + key + '" type="hidden" />');
    const my_input = document.createElement('input')
    my_input.name = key
    my_input.type = 'hidden'
    my_input.value = data[key]
    // my_input.attr("value", data[key]);
    // 附加到Form
    form.appendChild(my_input)
  }
  // console.log(form);
  document.body.appendChild(form)
  // 提交表单
  form.submit()
  form.remove()
}

import {
  getShopList,
  getAmazonArea,
  getShopStaff,
  getShopeeShop,
  deleteShop,
  getShopExclude,
  getSipShopId,
  checkShopNumber,
  getAccessToken,
  saveShop,
  saveShopByYuanmei
} from '@/api/shopManage'

import { getAllPlatformByYuanmei, getPlatformSite, verifyAPI } from '@/api/publicApi'

import { sha256_digest } from '@/utils/sha256'

// 排除员工
import excludeStaff from './components/ExcludeStaff.vue'
// 批量修改
import batchModify from './components/BatchModifyShopMsgs.vue'
//
import renderDialog from './components/RenderDialog'

export default {
  name: 'ShopManagement',
  components: {
    excludeStaff,
    batchModify,
    renderDialog
  },
  data() {
    // 表头数据
    const notSiteHeader = [
      {
        field: 'staff',
        align: 'center',
        title: '负责人'
      },
      {
        field: 'shopNumber',
        align: 'center',
        title: '店铺序号'
      },
      {
        field: 'shopName',
        align: 'center',
        title: '店铺名称'
      },
      {
        field: 'commissionRate',
        align: 'center',
        title: '佣金比例'
      },
      {
        field: 'isExpired',
        align: 'center',
        title: '是否过期'
      }
    ]
    const siteHeader = [
      {
        field: 'staff',
        align: 'center',
        title: '负责人'
      },
      {
        field: 'shopNumber',
        align: 'center',
        title: '店铺序号'
      },
      {
        field: 'shopName',
        align: 'center',
        title: '店铺名称'
      },
      {
        field: 'siteId',
        align: 'center',
        title: '店铺站点'
      },
      {
        field: 'commissionRate',
        align: 'center',
        title: '佣金比例'
      },
      {
        field: 'isExpired',
        align: 'center',
        title: '是否过期'
      }
    ]
    return {
      dialogVisible: false, // 弹窗
      renderPlat: '', // 传给子组件的当前平台
      pageShow: true, // 没有绑定店铺则隐藏页面
      platforms: [
        // 平台
        {
          text: 'Wish',
          value: 'wish',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          delete_uri: '/YuanmeiShop/delete',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: '/YuanmeiShop/oauth/access_token'
        },
        {
          text: 'Amazon',
          value: 'amazon',
          checked: '',
          list_uri: '/AmazonShop/list',
          delete_uri: '/AmazonShop/delete',
          save_uri: '/AmazonShop/save',
          check_shop_number_uri: '/AmazonShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: '/AmazonShop/oauth/access_token'
        },
        {
          text: 'Joom',
          value: 'joom',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          delete_uri: '/YuanmeiShop/delete',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: '/YuanmeiShop/oauth/access_token'
        },
        {
          text: 'Shopee',
          value: 'shopee',
          checked: '',
          list_uri: '/ShopeeShop/list',
          delete_uri: '/ShopeeShop/delete',
          save_uri: '/ShopeeShop/save',
          check_shop_number_uri: '',
          staff_uri: '/staff/getAllStaffName',
          token: ''
        },
        {
          text: 'Mall',
          value: 'mall',
          checked: '',
          list_uri: '/MallShop/list',
          delete_uri: '/MallShop/delete',
          save_uri: '/MallShop/save',
          check_shop_number_uri: '/MallShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: ''
        },
        {
          text: 'Lazada',
          value: 'lazada',
          checked: '',
          list_uri: '/LazadaShop/list',
          delete_uri: '/LazadaShop/delete',
          save_uri: '/LazadaShop/save',
          check_shop_number_uri: '/LazadaShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: '/LazadaShop/oauth/access_token'
        },
        {
          text: 'Allegro',
          value: 'allegro',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: '/YuanmeiShop/oauth/access_token'
        },
        {
          text: 'Aliexpress',
          value: 'aliexpress',
          checked: '',
          list_uri: '/AliexpressShop/list',
          delete_uri: '/AliexpressShop/delete',
          save_uri: '/AliexpressShop/save',
          check_shop_number_uri: '/AliexpressShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: '/AliexpressShop/oauth/access_token'
        },
        {
          text: 'Mercado',
          value: 'mercado',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          delete_uri: '/YuanmeiShop/delete',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: '/YuanmeiShop/oauth/access_token'
        },
        {
          text: 'B2w',
          value: 'b2w',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: ''
        },
        {
          text: 'Kaufland',
          value: 'kaufland',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: ''
        },
        {
          text: 'Walmart',
          value: 'walmart',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: ''
        },
        {
          text: 'Coupang',
          value: 'coupang',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: ''
        },
        {
          text: 'Linio',
          value: 'linio',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: ''
        },
        {
          text: 'Cdiscount',
          value: 'cdiscount',
          checked: '',
          list_uri: '/YuanmeiShop/list',
          add_uri: '/YuanmeiShop/add',
          update_uri: '/YuanmeiShop/update',
          check_shop_number_uri: '/YuanmeiShop/checkShopNumber',
          staff_uri: '/staff/getAllStaffName',
          token: '/YuanmeiShop/oauth/access_token'
        }
      ],
      platform: 0, // 选中的平台
      searchTypes: [
        // 搜索类型
        {
          text: '店铺序号',
          value: 'SHOP_NUMBER',
          checked: 'checked'
        },
        {
          text: '店铺名称',
          value: 'SHOP_NAME',
          checked: ''
        }
      ],
      searchType: 0, // 选中的搜索类型
      staffIds: [], // 店铺负责人
      staffId: '', // 选中的店铺负责人
      searchText: '', // 搜索内容
      searchName: '', // shopee搜索国家
      shopGroup: '', // 店铺分组
      shopName: '', // 店铺名称
      shopNumber: '', // 店铺序号
      isTokenValid: '', // 令牌是否有效
      tableHeight: 0, // 表格高度
      tokenValid: [
        {
          value: true,
          label: '有效'
        },
        {
          value: false,
          label: '无效'
        }
      ],
      allCountry: [
        {
          value: 'CB',
          label: '全部'
        },
        {
          value: 'SG',
          label: '新加坡'
        },
        {
          value: 'MY',
          label: '马来'
        },
        {
          value: 'ID',
          label: '印尼'
        },
        {
          value: 'PH',
          label: '菲律宾'
        },
        {
          value: 'TH',
          label: '泰国'
        },
        {
          value: 'VN',
          label: '越南'
        }
      ],
      shop: {
        // 店铺管理
        number: '', // 店铺序号
        name: '', // 店铺名称
        shopAdmin: '', // 新增/编辑店铺管理员
        time: '', // 交接时间
        maxProfit: '', // 最大利润
        errorMsg: '', // 店铺是否重复提示信息
        shopAPI: false, // //是否显示授权信息
        message: {
          // 是否授权信息
          text: '',
          color: ''
        },
        id: '',
        shopId: '',
        accessToken: '',
        refreshToken: '',
        lastDate: '',
        ClientId: '', // Client Id
        ClientSecret: '', // Client Secret
        RedirectURI: '', // Redirect URI
        Suffix: '', // 店铺后缀
        profitCurveLine: '', // 利润提成线
        minSaleVolume: '' // 业绩维护线
      },
      amazonShop: {
        country: [], // 国家
        currency: '', // 币种
        sellerNumber: '', // 卖家编号
        amazonToken: '' // 令牌 amazon用
      },
      coupangShop: {
        sellerNumber: '', // 卖家编号
        commissionRate: '' // 佣金比例
      },
      joomShop: {
        commissionRate: '', // 佣金比例
        siteId: '',
        shopSite: [],
        disabled: false,
        expiresInTime: '', // 过期时间
        shopGroup: '' // 店铺组
      },
      lazadaShop: {
        country: [], // 国家
        currency: '' // 币种
      },
      b2wShop: {
        apiToken: '',
        userName: '',
        xaccountmanagerKey: '',
        commissionRate: ''
      },
      allegroShop: {
        tokenType: '',
        expiresIn: '',
        scope: '',
        jti: '',
        expiresInTime: '', // 过期时间
        commissionRate: '',
        siteId: '',
        shopSite: [],
        disabled: false
      },
      mallShop: {
        shopUserName: '', // 店铺账号 mall用
        shopPassword: '', // 店铺密码 mall用
        profit: '' // 利润率
      },
      shopeeShop: {
        shopAPIShopee: false, // 是否显示shopee获得shopID
        shopSite: '', // shopee国家
        profit: '', // 利润率
        shopIDShopee: '', // shopee用
        partnerIdShopee: '842355', // shopee用
        secretKey:
          '12d962dd3ec928dce17ec6bf56f5c187e1339fc01cab6f3ce2fb68694b023b33' // shopee用
      },
      wishShop: {
        commissionRate: '',
        siteId: '',
        shopSite: [],
        disabled: false
      },
      aliexpressShop: {
        minProfit: '', // 最小利润
        profitRatio: '', // 利润率
        amazonToken: '' // 令牌
      },
      mercadoShop: {
        sellerId: '', // 卖家ID
        expiresInTime: '', // 过期时间
        marketplaces: '', // 可刊登站点JSON
        commissionRate: '' // 佣金比例
      },
      kauflandShop: {
        commissionRate: ''
      },
      walmartShop: {
        commissionRate: ''
      },
      linioShop: {
        userName: '',
        siteId: '',
        shopSite: [], // 站点
        commissionRate: '',
        disabled: false
      },
      cdiscountShop: {
        siteId: '',
        shopSite: [], // 站点列表
        commissionRate: '',
        token: '', // accessToken
        expiresInTime: '', // 过期时间
        apiMsg: {},
        disabled: false
      },
      regExp: /^0\.[0-9]\d*$/g, // 佣金比例的匹配正则
      tableData: [], // 所有数据
      rows: 20, // 当前页记录数
      page: 1, // 当前页数
      total: 0, // 全部数量
      pageList: [20, 30, 50, 100], // 设置页面可以显示的数据条数
      loading: '',
      currentPage: 1, // 当前页数
      delDialog: false, // 删除弹出框
      iframedialog: false, // 授权模态框
      row: [], // 选择的数据
      // 新增弹出框
      amazonDialog: false,
      joomDialog: false,
      lazadaDialog: false,
      allegroDialog: false,
      b2wDialog: false,
      mallDialog: false,
      shopeeDialog: false,
      wishDialog: false,
      aliexpressDialog: false,
      mercadoDialog: false,
      kauflandDialog: false,
      walmartDialog: false,
      coupangDialog: false,
      linioDialog: false,
      cdiscountDialog: false,
      frameSrc: '', // iframe的src
      oldChooseData: [],
      isMultiple: false, // 判断是否多选
      isDisabled: false, // 是否禁用
      // amazon店铺相关
      amazonArea: [
        { label: '广州', value: 0 },
        { label: '深圳', value: 1 }
      ],
      amazonAreaCheck: '', // amazon店铺地区选中
      editsDialog: false,
      edits: {
        shopAdmin: '',
        time: '',
        minSaleVolume: '',
        profitCurveLine: ''
      },
      shopeeShopType: '', // 站点类型
      shopeeMainShopList: [], // 主账号列表
      shopeeMainShop: '', // 主账号列表
      shopeeCountry: [
        { value: '', label: '全部' },
        { value: 'SG', label: '新加坡' },
        { value: 'MY', label: '马来' },
        { value: 'ID', label: '印尼' },
        { value: 'PH', label: '菲律宾' },
        { value: 'TH', label: '泰国' }
      ],
      parentShopIdShopee: '',
      typeDisabled: true,
      StaffExcludeData: [], // 排除员工列表
      editVisibleTitle: '',
      dialogFormVisible: false,
      editForm: {
        staffId: '',
        shopId: '',
        platform: '',
        excludeDate: ''
      },
      formLabelWidth: '120px',
      currentShopId: '', // 记录当前的店铺
      currentPlatForm: '', // 记录当前的平台
      isAddOrEdit: false, // 判断是点击增加店铺信息还是编辑，增加不显示排除员工, 编辑时为true显示
      isVerifyAPI: false, // 验证api账号和密码
      commissionRateTips: '佣金比例: 例(15%,填写0.15),佣金比例仅作用于无法拉取佣金的平台', // 佣金比例提示文字
      shopGroupTips: '店铺组：归类同一个店铺账号下的不同站点或子店铺',
      // 表头数据
      columns: {
        aliexpress: [
          {
            field: 'staff',
            align: 'center',
            title: '负责人'
          },
          {
            field: 'shopNumber',
            align: 'center',
            title: '店铺序号'
          },
          {
            field: 'shopName',
            align: 'center',
            title: '店铺名称'
          },
          {
            field: 'smallmum',
            align: 'center',
            title: '业绩维护线'
          },
          {
            field: 'maxProfit',
            align: 'center',
            title: '利润提成线'
          },
          {
            field: 'minProfit',
            align: 'center',
            title: '基准最小利润'
          },
          {
            field: 'profitRatio',
            align: 'center',
            title: '基准利润率'
          }
        ],
        allegro: notSiteHeader,
        amazon: [
          {
            field: 'staff',
            align: 'center',
            title: '负责人'
          },
          {
            field: 'shopNumber',
            align: 'center',
            title: '店铺序号'
          },
          {
            field: 'shopName',
            align: 'center',
            title: '店铺名称'
          },
          {
            field: 'country',
            align: 'center',
            title: '国家'
          },
          {
            field: 'currency',
            align: 'center',
            title: '币种'
          },
          {
            field: 'minSaleVolume',
            align: 'center',
            title: '业绩维护线'
          },
          {
            field: 'profitCurveLine',
            align: 'center',
            title: '利润提成线'
          }
        ],
        b2w: notSiteHeader,
        coupang: notSiteHeader,
        joom: notSiteHeader,
        kaufland: siteHeader,
        lazada: [
          {
            field: 'staff',
            align: 'center',
            title: '负责人'
          },
          {
            field: 'shopNumber',
            align: 'center',
            title: '店铺序号'
          },
          {
            field: 'shopName',
            align: 'center',
            title: '店铺名称'
          },
          {
            field: 'country',
            align: 'center',
            title: '店铺站点'
          },
          {
            field: 'minSaleVolume',
            align: 'center',
            title: '业绩维护线'
          },
          {
            field: 'profitCurveLine',
            align: 'center',
            title: '利润提成线'
          }
        ],
        mall: [
          {
            field: 'staff',
            align: 'center',
            title: '负责人'
          },
          {
            field: 'shopNumber',
            align: 'center',
            title: '店铺序号'
          },
          {
            field: 'shopName',
            align: 'center',
            title: '店铺名称'
          },
          {
            field: 'shopSku',
            align: 'center',
            title: '店铺后缀'
          },
          {
            field: 'minSaleVolume',
            align: 'center',
            title: '业绩维护线'
          },
          {
            field: 'profitCurveLine',
            align: 'center',
            title: '利润提成线'
          },
          {
            field: 'profitRatio',
            align: 'center',
            title: '利润率'
          }
        ],
        mercado: notSiteHeader,
        shopee: [
          {
            field: 'staff',
            align: 'center',
            title: '负责人'
          },
          {
            field: 'shopNumber',
            align: 'center',
            title: '店铺序号'
          },
          {
            field: 'shopSite',
            align: 'center',
            title: '店铺站点'
          },
          {
            field: 'minSaleVolume',
            align: 'center',
            title: '业绩维护线'
          },
          {
            field: 'profitCurveLine',
            align: 'center',
            title: '利润提成线'
          },
          {
            field: 'profitRatio',
            align: 'center',
            title: '利润率'
          }
        ],
        walmart: notSiteHeader,
        wish: siteHeader,
        linio: siteHeader,
        cdiscount: siteHeader
      },
      // 表格循环数组
      columnsData: []
    }
  },
  mounted() {
    // 加载平台列表
    const that = this
    getAllPlatformByYuanmei()
      .then((msg) => {
        const platform_array = []
        for (let i = 0; i < msg.data.length; i++) {
          for (let j = 0; j < that.platforms.length; j++) {
            if (that.platforms[j].text === msg.data[i].platform) {
              platform_array.push(that.platforms[j])
            }
          }
        }
        that.platforms = platform_array
        that.platforms[0].checked = 'checked'
        if (this.platforms[this.platform].value === 'amazon') {
          this.loadingAmazonArea()
        }
        // 初始化表头
        this.columnsData = this.columns[this.platforms[this.platform].value]
        this.$nextTick(() => {
          this.initSearchType()
          this.initStaff()
          this.initTable()
          this.iniTableHeight()
          this.initWindow()
        })
      })
    if (that.platforms.length === 0) {
      that.pageShow = false
    }
  },
  methods: {
    // 转换日期格式 格林威治时间转yyyy
    dateFormat(longTypeDate) {
      const date = new Date()
      date.setTime(longTypeDate)
      return format('yyyy-MM-dd hh:mm:ss')
    },
    // 初始化表格容器高度
    iniTableHeight() {
      const dataTablePageHeight = document
        .querySelector('#dataTableToolbar')
        .getBoundingClientRect().height // $("#dataTableToolbar").height();
      const bodyHeight = window.innerHeight // $("body").height();
      this.tableHeight = bodyHeight - dataTablePageHeight - 146
    },
    // 改变平台
    changePlatform(index) {
      if (index !== this.platform) {
        for (let i = 0; i < this.platforms.length; i++) {
          const platform = this.platforms[i]
          platform.checked = ''
        }
        this.platforms[index].checked = 'checked'
        this.platform = index
        // 加载表头数据
        this.columnsData = this.columns[this.platforms[this.platform].value]
        this.searchText = ''
        this.staffId = ''
        this.searchType = 0
        this.renderPlat = this.platforms[this.platform].text
        this.initSearchType()
        this.search()
        // 重置 isAddOrEdit
        if (this.isAddOrEdit === true) {
          this.isAddOrEdit = false
        }
      }
    },
    // 初始化店铺负责人
    initStaff() {
      getShopStaff(this.platforms[this.platform].staff_uri)
        .then((res) => {
          const arr = []
          // arr.push({text: "", value: ""});
          for (let i = 0; i < res.data.length; i++) {
            const obj = {
              text: res.data[i].staffName,
              value: res.data[i].id
            }
            arr.push(obj)
          }
          this.staffIds = arr
        })
    },
    // 初始化搜索类型参数
    initSearchType() {
      const platArr = ['wish', 'amazon', 'aliexpress', 'mercado',
        'lazada', 'allegro', 'b2w', 'kaufland', 'walmart',
        'coupang', 'linio', 'cdiscount']
      if (platArr.includes(this.platforms[this.platform].value)) {
        this.searchTypes = [
          {
            text: '店铺序号',
            value: 'SHOP_NUMBER',
            checked: 'checked'
          },
          {
            text: '店铺名称',
            value: 'SHOP_NAME',
            checked: ''
          }
        ]
      } else {
        this.searchTypes = [
          {
            text: '店铺序号',
            value: 'ShopNumber',
            checked: 'checked'
          },
          {
            text: '店铺名称',
            value: 'ShopName',
            checked: ''
          }
        ]
      }
    },
    // 加载Amazon平台 地区
    loadingAmazonArea() {
      const that = this
      getAmazonArea()
        .then((data) => { // msg
          // var data = msg.data;
          if (data['success']) {
            const area = data.msg
            if (area === '广州') that.amazonAreaCheck = 0
            else if (area === '深圳') that.amazonAreaCheck = 1
          }
        })
    },
    // 加载Shopee平台主账号
    loadingShopeeShop() {
      const that = this
      getShopeeShop()
        .then((res) => {
          // console.log(res)
          // console.log(that.shopeeMainShopList)
          for (let i = 0; i < res.length; i++) {
            if (res[i].shopType === '0') {
              that.shopeeMainShopList.push({
                value: res[i].id,
                label: res[i].shopNumber + '-' + res[i].shopSite
              })
            }
          }
        })
    },
    // 改版查询类型
    changeSearchType(index) {
      for (let i = 0; i < this.searchTypes.length; i++) {
        const searchType = this.searchTypes[i]
        searchType.checked = ''
      }
      this.searchTypes[index].checked = 'checked'
      this.searchType = index
      this.search()
    },
    // 获得参数
    getQueryParams() {
      if (this.staffId == null) {
        this.staffId = ''
      }
      const searchType = this.searchTypes[this.searchType].value // 搜索类型
      const searchValue = this.searchText // 搜索内容
      const staffId = this.staffId // 店铺负责人
      const shopSite = this.searchName // shopee搜索类型
      const Params = {}
      Params.rows = this.rows
      Params.page = this.page

      if (['shopee', 'amazon'].includes(this.platforms[this.platform].value)) {
        Params.searchValue = searchValue
        Params.staffId = staffId
        Params.searchType = searchType
        Params.area = this.amazonAreaCheck
        Params.shopSite = shopSite
        if (staffId) {
          Params.staffId = staffId
        }
      } else {
        // yuanmeiShop/list
        if (staffId) {
          Params.staffId = staffId
        }
        if (this.shopGroup) {
          Params.shopGroup = this.shopGroup
        }
        if (this.shopName) {
          Params.shopName = this.shopName
        }
        if (this.shopNumber) {
          Params.shopNumber = this.shopNumber
        }
        if (this.isTokenValid || this.isTokenValid === false) {
          Params.isTokenValid = this.isTokenValid
        }
        Params.platform = this.platforms[this.platform].text
      }
      return Params
    },
    // 初始化表格
    initTable() {
      return new Promise((resolve, reject) => {
        const obj = this.getQueryParams()
        this.loading = this.$loading({
          lock: true,
          text: '正在加载中....',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        const platArr = ['wish', 'joom', 'b2w', 'mercado', 'kaufland', 'walmart', 'coupang', 'linio', 'cdiscount', 'allegro']
        const methods = platArr.includes(this.platforms[this.platform].value)
          ? 'get'
          : 'post'
        const that = this
        getShopList(that.platforms[that.platform].list_uri, methods, obj)
          .then((data) => {
            that.loading.close()
            if (data.code === 200) {
              that.tableData = data.data.rows
              that.total = data.data.total
            } else {
              that.tableData = data.rows
              that.total = data.total
            }
            resolve()
          }).catch(() => {
            that.loading.close()
          })
      })
    },
    // 自定义formatter 用于格式化单元格内容
    formatterColumn(val, field) {
      /*
        *
        *  参数说明
        *     val: 字段值
        *     field: 字段名
        *
      */
      if (field === 'staff' && val !== null) {
        // 员工
        return val.staffName
      } else if ((field === 'country' || field === 'shopSite') && val !== null) {
        // lazada shopee站点
        switch (val) {
          case 'SG':
            return '新加坡'
          case 'MY':
            return '马来'
          case 'ID':
            return '印尼'
          case 'TW':
            return '台湾'
          case 'PH':
            return '菲律宾'
          case 'TH':
            return '泰国'
          case 'VN':
            return '越南'
          case 'BR':
            return '巴西'
          default:
            return val
        }
      } else if ((field === 'siteId') && val !== null) {
        switch (val) {
          case 'CL':
            return '智利'
          case 'CO':
            return '哥伦比亚'
          case 'MX':
            return '墨西哥'
          case 'PE':
            return '秘鲁'
          case 'FR':
            return '法国'
          case 'US':
            return '美国'
          default:
            return val
        }
      } else {
        // 默认不格式化
        return val
      }
    },
    // 搜索
    search() {
      this.currentPage = 1
      this.page = this.currentPage
      this.initTable().then(() => {
        this.iniTableHeight()
      })
    },
    // 分页
    // 修改一页显示的记录数量
    handleSizeChange(val) {
      this.loading = true
      this.currentPage = 1
      this.page = this.currentPage
      this.rows = val
      this.initTable()
    },
    // 翻页
    handleCurrentChange(val) {
      this.page = val
      this.initTable()
    },
    // 获取选中的值
    getSelectedValue(val) {
      this.row = val
    },
    // 关闭批量修改
    closeEditDialog(flag) {
      this.editsDialog = flag
    },
    // 消息弹框
    alertMessage(text, cla) {
      var arr = {
        success: '成功',
        error: '失败'
      }
      let texts = ''
      for (var i in arr) {
        if (i === cla) {
          texts = arr[i]
        }
      }
      this.$notify({
        title: texts,
        message: text,
        type: cla,
        position: 'bottom-right',
        duration: 2500
      })
    },
    // 删除
    del() {
      if (this.row.length > 0) {
        this.delDialog = true
      } else {
        this.alertMessage('请选择要删除的对象！', 'error')
      }
    },
    // 删除一个店铺
    deleteShop() {
      const rows = this.row
      const ids = []
      rows.forEach((ele) => {
        ids.push(ele.id)
      })
      const obj = {}
      if (['wish', 'amazon', 'mall', 'mercado', 'joom'].includes(this.platforms[this.platform].value)) {
        obj.ids = ids.join(',')
      } else if (this.platforms[this.platform].value === 'shopee') {
        obj.id = ids.join(',')
      }
      const methods = ['wish', 'mercado', 'joom'].includes(this.platforms[this.platform].value) ? 'delete' : 'post'
      deleteShop(this.platforms[this.platform].delete_uri, methods, obj)
        .then((msg) => {
          if (msg.success) {
            this.alertMessage(msg.msg, 'success')
          } else if (msg.code === 200) {
            this.alertMessage(msg.data, 'success')
          } else {
            this.alertMessage(
              msg.msg == null ? msg.data : msg.msg,
              'error'
            )
          }
          this.delDialog = false
          this.search()
        })
    },
    // 下拉框发生变化时
    changeValue(val) {
      if (this.isMultiple) {
        const allValues = this.allCountry.map((item) => {
          return item.value
        })
        // 用来储存上一次选择的值，可进行对比
        const oldVal = this.oldChooseData.length > 0 ? this.oldChooseData : []

        // 若选择全部
        if (val.includes('CB')) {
          this.lazadaShop.country = allValues
        }

        // 取消全部选中， 上次有， 当前没有， 表示取消全选
        if (oldVal.includes('CB') && !val.includes('CB')) {
          this.lazadaShop.country = []
        }

        // 点击非全部选中，需要排除全部选中 以及 当前点击的选项
        // 新老数据都有全部选中
        if (oldVal.includes('CB') && val.includes('CB')) {
          const index = val.indexOf('CB')
          val.splice(index, 1) // 排除全选选项
          this.lazadaShop.country = val
        }

        // 全选未选，但是其他选项都全部选上了，则全选选上
        if (!oldVal.includes('CB') && !val.includes('CB')) {
          if (val.length === allValues.length - 1) {
            this.lazadaShop.country = ['CB'].concat(val)
          }
        }
        // 储存当前选择的最后结果 作为下次的老数据
        this.oldChooseData = this.lazadaShop.country
        if (this.lazadaShop.country.length > 1) {
          this.isDisabled = true
        } else {
          this.isDisabled = false
        }
      } else {
        this.lazadaShop.country = val
      }
    },
    // 新增/编辑
    add(action, index = 0) {
      const obj = {
        amazon: 'amazonDialog',
        joom: 'joomDialog',
        lazada: 'lazadaDialog',
        allegro: 'allegroDialog',
        b2w: 'b2wDialog',
        mall: 'mallDialog',
        shopee: 'shopeeDialog',
        wish: 'wishDialog',
        aliexpress: 'aliexpressDialog',
        mercado: 'mercadoDialog',
        kaufland: 'kauflandDialog',
        walmart: 'walmartDialog',
        coupang: 'coupangDialog',
        linio: 'linioDialog',
        cdiscount: 'cdiscountDialog'
      }
      this[obj[this.platforms[this.platform].value]] = true

      if (this.platforms[this.platform].value === 'shopee') {
        this.loadingShopeeShop()
      } else if (['linio', 'allegro', 'joom', 'wish'].includes(this.platforms[this.platform].value)) {
        this.getPlatformSite(this.platforms[this.platform].text)
      } else if (this.platforms[this.platform].value === 'cdiscount') {
        this.isVerifyAPI = false
        this.getPlatformSite('Cdiscount')
      }

      this.isDisabled = false
      this.isMultiple = false
      if (action === 'create') {
        this.isMultiple = true
        this.typeDisabled = false
        this.shop = {
          // 店铺管理
          number: '', // 店铺序号
          name: '', // 店铺名称
          shopAdmin: '', // 新增/编辑店铺管理员
          minProfit: '',
          time: '', // 交接时间
          maxProfit: '', // 最大利润
          errorMsg: '', // 店铺是否重复提示信息
          shopAPI: false, // //是否显示授权信息
          id: '',
          shopId: '',
          accessToken: '',
          refreshToken: '',
          lastDate: '',
          ClientId:
            ['wish', 'aliexpress'].includes(this.platforms[this.platform].value)
              ? '5c4e5c53933b07729818d248'
              : '', // Client Id
          ClientSecret:
            ['wish', 'aliexpress'].includes(this.platforms[this.platform].value)
              ? '00f5a38156fc4971b0025d8b737ed549'
              : '', // Client Secret
          RedirectURI:
            ['wish', 'aliexpress', 'joom'].includes(this.platforms[this.platform].value)
              ? 'https://yuanmeinetwork.com/API/access_token/callBack'
              : '', // Redirect URI
          Suffix: '', // 店铺后缀
          message: {
            // 是否授权信息
            text: '未授权',
            color: 'red'
          },
          profitCurveLine: '',
          minSaleVolume: ''
        }
        this.amazonShop = {
          country: [], // 国家
          currency: '', // 币种
          sellerNumber: '', // 卖家编号
          amazonToken: '' // 令牌 amazon用
        }
        this.joomShop = {
          commissionRate: '', // 佣金比例
          shopSite: [],
          expiresInTime: '', // 过期时间
          shopGroup: ''
        }
        this.lazadaShop = {
          country: [], // 国家
          currency: '' // 币种
        }
        this.mallShop = {
          shopUserName: '', // 店铺账号 mall用
          shopPassword: '', // 店铺密码 mall用
          profit: '0.25' // 利润率
        }
        this.mercadoShop = {
          commissionRate: '' // 佣金比例
        }
        this.shopeeShop = {
          shopAPIShopee: false, // 是否显示shopee获得shopID
          shopSite: '', // shopee国家
          profit: '0.25', // 利润率
          shopIDShopee: '', // shopee用
          partnerIdShopee: '842355', // shopee用
          secretKey:
            '12d962dd3ec928dce17ec6bf56f5c187e1339fc01cab6f3ce2fb68694b023b33' // shopee用
        }
        this.wishShop = {
          commissionRate: '', // 佣金比例
          shopSite: []
        }
        this.aliexpressShop = {
          minProfit: '0.25', // 最小利润
          amazonToken: '', // aliexpress令牌
          profitRatio: '0.25'
        }
        this.b2wShop = {
          apiToken: '',
          userName: '',
          xaccountmanagerKey: '',
          commissionRate: ''
        }
        this.kauflandShop = {
          commissionRate: ''
        }
        this.walmartShop = {
          commissionRate: ''
        }
        this.coupangShop = {
          sellerNumber: '',
          commissionRate: ''
        }
        this.linioShop.userName = ''
        this.linioShop.commissionRate = ''
        this.cdiscountShop.commissionRate = ''
        if (
          this.platforms[this.platform].value === 'wish' ||
          this.platforms[this.platform].value === 'joom'
        ) {
          this.shop.shopAPI = true
        } else if (this.platforms[this.platform].value === 'shopee') {
          this.shop.id = -1
          this.shopeeShop.shopAPIShopee = true
        }
        if (this.platforms[this.platform].value === 'mercado') {
          this.shop.shopAPI = true
          this.shop.ClientId = '4107257804931859'
          this.shop.ClientSecret = 'R3drLg3BPExl220qhhTKnfVmSAqrsQSK'
          this.shop.RedirectURI =
            'https://yuanmeinetwork.com/API/access_token/callBack'
        }
        if (this.platforms[this.platform].value === 'allegro') {
          this.shop.ClientId = 'bc392e82d2f2439a9609b00ee7307ee2'
          this.shop.ClientSecret =
            'A1W7FxxeMTPJqFy5GReyfVnxa32HBd4E5MTuh9edMxvpDjrxyFPhZsHoavyvCPHu'
          this.shop.RedirectURI =
            'https://yuanmeinetwork.com/API/access_token/callBack'
          this.allegroShop.commissionRate = ''
          this.allegroShop.shopSite = []
        }
        if (this.platforms[this.platform].value === 'kaufland') {
          this.shop.ClientId = ''
          this.shop.ClientSecret = ''
          this.shop.RedirectURI =
            'https://yuanmeinetwork.com/API/access_token/callBack'
        }
        if (['walmart', 'coupang', 'cdiscount'].includes(this.platforms[this.platform].value)) {
          this.shop.ClientId = ''
          this.shop.ClientSecret = ''
        }
        if (this.platforms[this.platform].value === 'linio') {
          this.shop.ClientSecret = ''
        }

        // 重置 isAddOrEdit
        if (this.isAddOrEdit === true) {
          this.isAddOrEdit = false
        }
      } else if (action === 'edit') {
        const row = this.tableData[index]
        this.shop = {
          // 店铺管理
          number: row.shopNumber == null ? '' : row.shopNumber, // 店铺序号
          name: row.shopName == null ? '' : row.shopName, // 店铺名称
          shopAdmin:
            row.staff == null ? '' : row.staff.id == null ? '' : row.staff.id, // 新增/编辑店铺管理员
          time: row.changeTime == null ? '' : row.changeTime.substr(0, 10), // 交接时间
          minProfit: row.minProfit == null ? '' : row.minProfit, // 最小利润
          errorMsg: '',
          shopAPI: false,
          message: {
            // 是否授权信息
            text: '',
            color: ''
          },
          id: row.id == null ? '' : row.id,
          shopId: row.shopId == null ? '' : row.shopId,
          accessToken: row.accessToken == null ? '' : row.accessToken,
          refreshToken: row.refreshToken == null ? '' : row.refreshToken,
          lastDate: row.lastDate == null ? '' : row.lastDate,
          ClientId: row.clientId == null ? '' : row.clientId, // Client Id
          ClientSecret: row.clientSecret == null ? '' : row.clientSecret, // Client Secret
          RedirectURI: row.redirectUri == null ? '' : row.redirectUri, // Redirect URI
          Suffix: row.wishShopSku == null ? '' : row.wishShopSku, // 店铺后缀
          maxProfit: row.profitCurveLine == null ? '' : row.profitCurveLine, // 利润提成线
          profitCurveLine:
            row.profitCurveLine == null ? '' : row.profitCurveLine, // 利润提成线
          minSaleVolume: row.minSaleVolume == null ? '' : row.minSaleVolume // 业绩维护线
        }
        this.shopeeShop = {
          partnerIdShopee: '842355', // shopee用
          secretKey:
            '12d962dd3ec928dce17ec6bf56f5c187e1339fc01cab6f3ce2fb68694b023b33' // shopee用
        }
        if (this.platforms[this.platform].value === 'wish') {
          this.wishShop.commissionRate = row.commissionRate == null ? '' : row.commissionRate // 佣金比例
          this.wishShop.siteId = row.siteId == null ? '' : row.siteId
          this.shop.shopAPI = true
          this.shop.time = row.changeDate
          this.shop.RedirectURI = row.redirectUrl
          if (
            row.id === null ||
            row.accessToken === null ||
            row.accessToken.length === 0
          ) {
            this.shop.message.text = '该店铺未授权,请填写信息授权!'
            this.shop.message.color = 'red'
          } else {
            this.shop.message.text = '该店铺已授权,令牌更新时间' + row.expiresTime
            this.shop.message.color = 'green'
          }
        } else if (this.platforms[this.platform].value === 'joom') {
          this.shop.shopAPI = true
          this.joomShop.commissionRate = row.commissionRate == null ? '' : row.commissionRate // 佣金比例
          this.joomShop.siteId = row.siteId == null ? '' : row.siteId
          this.shop.number = row.shopNumber == null ? '' : row.shopNumber
          this.shop.name = row.shopName == null ? '' : row.shopName
          this.shop.time = row.changeDate
          this.shop.RedirectURI = row.redirectUrl == null ? '' : row.redirectUrl
          this.shop.shopAdmin =
            row.staff == null ? '' : row.staff.id == null ? '' : row.staff.id
          this.joomShop.Suffix = row.shopSku == null ? '' : row.shopSku // 店铺后缀
          this.joomShop.shopGroup = row.shopGroup == null ? '' : row.shopGroup // 店铺组
        } else if (this.platforms[this.platform].value === 'shopee') {
          this.shopeeShop.shopAPIShopee = true
          this.shopeeShop.profit =
            row.profitRatio == null ? '' : row.profitRatio // 利润率
          this.shop.number = row.shopNumber == null ? '' : row.shopNumber
          this.shop.name = row.shopName == null ? '' : row.shopName
          this.shopeeShop.shopSite = row.shopSite == null ? '' : row.shopSite
          this.shopeeShop.shopIDShopee = row.shopId == null ? '' : row.shopId
          this.shopeeShop.partnerIdShopee =
            row.partnerId == null ? '' : row.partnerId
          this.shopeeShop.secretKey =
            row.secretKey == null ? '' : row.secretKey
          if (row.shopType === 0) {
            this.shopeeShopType = '0'
          } else if (row.shopType === 1) {
            this.shopeeShopType = '1'
          }
          this.typeDisabled = true
          this.shopeeMainShop = row.parentShopId
        } else if (this.platforms[this.platform].value === 'amazon') {
          this.amazonShop.country = row.country == null ? '' : row.country // 国家
          this.amazonShop.currency = row.currency == null ? '' : row.currency // 币种
          this.amazonShop.sellerNumber =
            row.sellerId == null ? '' : row.sellerId
          this.amazonShop.amazonToken =
            row.mwsAuthToken == null ? '' : row.mwsAuthToken
          if (
            row.id === null ||
            row.adAccessToken === null ||
            row.adRefreshToken === null
          ) {
            this.shop.message.text = '该店铺未授权广告API,请填写信息授权!'
            this.shop.message.color = 'red'
          } else {
            this.shop.message.text =
              '该店铺已授权广告API,令牌过期时间' + row.expiresIn
            this.shop.message.color = 'green'
          }
        } else if (this.platforms[this.platform].value === 'mall') {
          this.mallShop.profit = row.profitRatio == null ? '' : row.profitRatio // 利润率
          this.shop.number = row.shopNumber == null ? '' : row.shopNumber
          this.shop.name = row.shopName == null ? '' : row.shopName
          this.mallShop.shopUserName =
            row.shopUsername == null ? '' : row.shopUsername
        } else if (this.platforms[this.platform].value === 'aliexpress') {
          this.aliexpressShop.minProfit =
            row.minProfit == null ? '' : row.minProfit // 最小利润
          this.aliexpressShop.profitRatio =
            row.profitRatio == null ? '' : row.profitRatio // 利润率
          this.shop.profitCurveLine =
            row.profitCurveLine == null ? '' : row.profitCurveLine // 利润提成线
          this.shop.minSaleVolume =
            row.minSaleVolume == null ? '' : row.minSaleVolume // 业绩维护线
          this.aliexpressShop.aliexpressToken =
            row.mwsAuthToken == null ? '' : row.mwsAuthToken
          if (
            row.id === null ||
            row.adAccessToken === null ||
            row.adRefreshToken === null
          ) {
            this.shop.message.text = '该店铺未授权广告API,请填写信息授权!'
            this.shop.message.color = 'red'
          } else {
            this.shop.message.text =
              '该店铺已授权广告API,令牌过期时间' + row.expiresIn
            this.shop.message.color = 'green'
          }
        } else if (this.platforms[this.platform].value === 'lazada') {
          this.shop.shopAPI = false
          this.lazadaShop.country = row.country == null ? '' : row.country // 国家
          this.lazadaShop.currency = row.currency == null ? '' : row.currency // 币种
          this.shop.profitCurveLine =
            row.profitCurveLine == null ? '' : row.profitCurveLine // 利润提成线
          this.shop.minSaleVolume =
            row.minSaleVolume == null ? '' : row.minSaleVolume // 业绩维护线
          if (
            row.id === null ||
            row.accessToken === null ||
            row.accessToken.length === 0
          ) {
            this.shop.message.text = '该店铺未授权,请填写信息授权!'
            this.shop.message.color = 'red'
          } else {
            this.shop.message.text =
              '该店铺已授权,令牌过期时间' + row.refreshExpiresIn
            this.shop.message.color = 'green'
          }
        } else if (this.platforms[this.platform].value === 'allegro') {
          this.allegroShop.commissionRate = row.commissionRate == null ? '' : row.commissionRate // 佣金比例
          this.shop.RedirectURI = row.redirectUrl
          this.shop.time = row.changeDate
          this.allegroShop.siteId = row.siteId == null ? '' : row.siteId
          if (
            row.id === null ||
            row.accessToken === null ||
            row.accessToken.length === 0
          ) {
            this.shop.message.text = '该店铺未授权,请填写信息授权!'
            this.shop.message.color = 'red'
          } else {
            this.shop.message.text =
              '该店铺已授权,令牌过期时间' + row.expiresTime
            this.shop.message.color = 'green'
          }
        } else if (this.platforms[this.platform].value === 'b2w') {
          this.shop.shopAdmin = row.staffId == null ? '' : row.staffId // 负责人
          this.shop.time = row.changeDate == null ? '' : row.changeDate // 店铺交接时间
          this.b2wShop.apiToken = row.accessToken == null ? '' : row.accessToken // API令牌
          this.b2wShop.userName = row.userName == null ? '' : row.userName // 用户邮箱
          this.b2wShop.xaccountmanagerKey = row.clientId == null ? '' : row.clientId // X_ACCOUNTMANAGER_KEY
          this.b2wShop.commissionRate = row.commissionRate == null ? '' : row.commissionRate // 佣金比例
        } else if (this.platforms[this.platform].value === 'mercado') {
          this.mercadoShop.sellerId = row.sellerId
          this.mercadoShop.commissionRate = row.commissionRate
          this.shop.shopAPI = true
          this.shop.ClientId = row.clientId
          this.shop.ClientSecret = row.clientSecret
          this.shop.RedirectURI =
            'https://yuanmeinetwork.com/API/access_token/callBack'
          if (
            row.id === null ||
            row.accessToken === null ||
            row.accessToken.length === 0
          ) {
            this.shop.message.text = '该店铺未授权,请填写信息授权!'
            this.shop.message.color = 'red'
          } else {
            this.shop.message.text =
              '该店铺已授权,令牌过期时间' + row.expiresTime
            this.shop.message.color = 'green'
          }
          this.shop.time = row.changeDate
        } else if (this.platforms[this.platform].value === 'kaufland') {
          this.shop.RedirectURI = row.redirectUrl
          this.shop.time = row.changeDate
          this.kauflandShop.commissionRate = row.commissionRate == null ? '' : row.commissionRate // 佣金比例
        } else if (this.platforms[this.platform].value === 'walmart') {
          this.shop.name = row.shopName
          this.shop.number = row.shopNumber
          this.shop.ClientId = row.clientId
          this.shop.ClientSecret = row.clientSecret
          this.shop.time = row.changeDate
          this.shop.id = row.id
          this.walmartShop.commissionRate = row.commissionRate == null ? '' : row.commissionRate // 佣金比例
        } else if (this.platforms[this.platform].value === 'coupang') {
          this.shop.name = row.shopName
          this.shop.number = row.shopNumber
          this.shop.ClientId = row.clientId
          this.shop.ClientSecret = row.clientSecret
          this.shop.time = row.changeDate
          this.shop.id = row.id
          this.coupangShop.sellerNumber = row.sellerId == null ? '' : row.sellerId
          this.coupangShop.commissionRate = row.commissionRate == null ? '' : row.commissionRate
        } else if (this.platforms[this.platform].value === 'linio') {
          this.shop.name = row.shopName
          this.shop.number = row.shopNumber
          this.shop.ClientSecret = row.clientSecret
          this.shop.time = row.changeDate
          this.shop.id = row.id
          this.linioShop.userName = row.userName == null ? '' : row.userName
          this.linioShop.siteId = row.siteId == null ? '' : row.siteId
          this.linioShop.commissionRate = row.commissionRate == null ? '' : row.commissionRate
        } else if (this.platforms[this.platform].value === 'cdiscount') {
          this.shop.name = row.shopName
          this.shop.number = row.shopNumber
          this.shop.ClientId = row.clientId
          this.shop.ClientSecret = row.clientSecret
          this.shop.time = row.changeDate
          this.shop.id = row.id
          this.cdiscountShop.siteId = row.siteId == null ? '' : row.siteId
          this.cdiscountShop.commissionRate = row.commissionRate == null ? '' : row.commissionRate
          if (row.id === null || row.accessToken === null || row.accessToken.length === 0) {
            this.shop.message.text = '该店铺未授权,请填写信息授权!'
            this.shop.message.color = 'red'
          } else {
            this.shop.message.text = '该店铺已授权,令牌过期时间' + row.expiresTime
            this.shop.message.color = 'green'
            this.isVerifyAPI = true
          }
          // 存储原始api信息
          this.cdiscountShop.apiMsg = {
            ClientId: row.clientId,
            ClientSecret: row.clientSecret
          }
        }
        // row.id ==> 店铺id
        // this.platforms[this.platform].text ==> 平台
        const shopId = row.id == null ? '' : row.id.toString()
        const platForm = this.platforms[this.platform].text
        // 记录当前店铺和平台
        this.currentShopId = shopId
        this.currentPlatForm = platForm
        // 开启显示排除员工
        this.isAddOrEdit = true
        // 获取员工店铺排除列表
        this.getStaffShopExclude(platForm, shopId)
      }
    },

    // 关闭拟态框
    closeDialog() {
      const obj = {
        amazon: 'amazonDialog',
        joom: 'joomDialog',
        lazada: 'lazadaDialog',
        allegro: 'allegroDialog',
        b2w: 'b2wDialog',
        mall: 'mallDialog',
        shopee: 'shopeeDialog',
        wish: 'wishDialog',
        aliexpress: 'aliexpressDialog',
        mercado: 'mercadoDialog',
        kaufland: 'kauflandDialog',
        walmart: 'walmartDialog',
        coupang: 'coupangDialog',
        linio: 'linioDialog'
      }
      this[obj[this.platforms[this.platform].value]] = false

      this.isAddOrEdit = false
    },

    // 获取员工排除列表
    getStaffShopExclude(platform, shopid) {
      this.loading = this.$loading({
        lock: true,
        text: '正在加载中,请稍后......',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const params = {
        platform: platform,
        shopId: shopid
      }
      getShopExclude(params).then(res => {
        this.StaffExcludeData = res.data
        this.loading.close()
      }).catch(() => {
        this.loading.close()
      })
    },

    refreshExclude() {
      this.getStaffShopExclude(this.currentPlatForm, this.currentShopId)
    },

    // API授权
    open_access_window() {
      if (['wish', 'joom', 'aliexpress', 'mercado', 'allegro'].includes(this.platforms[this.platform].value)) {
        const clientId = this.shop.ClientId
        const clientSecret = this.shop.ClientSecret
        const redirectUri = this.shop.RedirectURI
        if (clientId === '') {
          this.alertMessage('请输入Client Id', 'error')
        } else if (clientSecret === '') {
          this.alertMessage('请输入Client Secret', 'error')
        } else if (redirectUri === '') {
          this.alertMessage('请输入Redirect URI', 'error')
        } else {
          this.frameSrc = ''
          const redirect_url =
            'https://yuanmeinetwork.com/API/access_token/callBack'
          let frameSrc = ''
          if (
            this.platforms[this.platform].value === 'wish' ||
            this.platforms[this.platform].value === 'aliexpress'
          ) {
            frameSrc = 'https://merchant.wish.com/v3/oauth/authorize'
            submit_Form(frameSrc, 'GET', '_blank', { client_id: clientId })
          } else if (this.platforms[this.platform].value === 'joom') {
            this.iframedialog = true
            frameSrc =
              'https://api-merchant.joom.com/api/v2/oauth/authorize?client_id=' +
              clientId +
              '&redirect=' +
              encodeURIComponent(redirect_url)
            this.frameSrc = frameSrc
          } else if (this.platforms[this.platform].value === 'allegro') {
            frameSrc = 'https://allegro.pl/auth/oauth/authorize'
            submit_Form(frameSrc, 'GET', '_blank', {
              response_type: 'code',
              client_id: clientId,
              redirect_uri: redirectUri
            })
          } else if (this.platforms[this.platform].value === 'mercado') {
            frameSrc = 'https://global-selling.mercadolibre.com/authorization/'
            submit_Form(frameSrc, 'GET', '_blank', {
              response_type: 'code',
              client_id: clientId,
              redirect_uri: redirectUri
            })
          }
        }
      } else if (this.platforms[this.platform].value === 'shopee') {
        if (this.shopeeShopType === '0') {
          this.iframedialog = true
          this.frameSrc = ''
          this.parentShopIdShopee = ''
          const partner_id = this.shopeeShop.partnerIdShopee
          const redirectUri =
            'https://yuanmeinetwork.com/API/access_token/callBack'
          const partner_key = this.shopeeShop.secretKey
          const token = sha256_digest(partner_key + redirectUri)
          const frameSrc =
            'https://partner.shopeemobile.com/api/v1/shop/auth_partner'
          submit_Form(frameSrc, 'GET', '_blank', {
            id: partner_id,
            token: token,
            redirect: redirectUri
          })
        } else {
          getSipShopId(this.shopeeMainShop, this.shopeeShop.shopSite)
            .then((res) => {
              if (res.success) {
                this.shopeeShop.shopIDShopee = res.msg
                this.parentShopIdShopee = this.shopeeMainShop
              } else {
                this.alertMessage(res.msg, 'error')
              }
              // console.log(res)
            })
        }
      } else if (this.platforms[this.platform].value === 'lazada') {
        this.iframedialog = true
        this.frameSrc = ''
        var country
        if (this.lazadaShop.country.length > 1) {
          country = 'cb'
        } else {
          country = this.lazadaShop.country.join().toLowerCase()
        }
        const redirect_url =
          'https://yuanmeinetwork.com/API/access_token/callBack'
        const frameSrc =
          'https://auth.lazada.com/oauth/authorize?response_type=code&force_auth=true&client_id=111819&redirect=' +
          encodeURIComponent(redirect_url) +
          '&country=' +
          country
        this.frameSrc = frameSrc
      } else if (this.platforms[this.platform].value === 'amazon') {
        if (
          this.amazonShop.country === null ||
          this.amazonShop.country.trim() === ''
        ) {
          this.$alert('请选择国家', '提示', {
            confirmButtonText: '确定'
          })
          return
        }
        const redirect_url =
          'https://yuanmeinetwork.com/API/access_token/callBack'
        this.shop.RedirectURI = redirect_url
        const url = this.getAmazonUrl(this.amazonShop.country)
        const frameSrc = `${url}?client_id=amzn1.application-oa2-client.a1ecda0c254943878b964007f9c89708&scope=cpc_advertising:campaign_management&response_type=code&redirect_uri=${redirect_url}`
        window.open(frameSrc, '_blank')
      }
    },
    // amazon 站点授权url
    getAmazonUrl(country) {
      if (country === 'US' || country === 'CA') {
        return 'https://www.amazon.com/ap/oa'
      } else if (['UK', 'FR', 'IT', 'ES', 'DE'].includes(country)) {
        return 'https://eu.account.amazon.com/ap/oa'
      } else {
        return 'https://apac.account.amazon.com/ap/oa'
      }
    },
    // 检查是否出现重复的店铺序号
    checkShopNumber() {
      const shopNumber = this.shop.number
      if (shopNumber !== '') {
        if (
          ['wish', 'mercado', 'kaufland', 'b2w', 'walmart', 'coupang', 'linio', 'cdiscount', 'allegro', 'joom'].includes(this.platforms[this.platform].value)
        ) {
          checkShopNumber(this.platforms[this.platform].check_shop_number_uri, 'get', shopNumber)
            .then((msg) => {
              if (msg.code === 200) {
                this.shop.errorMsg = msg.data
              } else {
                this.shop.errorMsg = msg.message
              }
            })
        } else {
          checkShopNumber(this.platforms[this.platform].check_shop_number_uri, 'post', shopNumber)
            .then((msg) => {
              this.shop.errorMsg = msg.msg
            })
        }
      }
    },
    // 平台验证api
    verifyAPI() {
      this.loading = this.$loading({
        lock: true,
        text: '请稍后...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      const obj = {
        shopNumber: this.shop.number,
        platform: this.platforms[this.platform].text,
        clientId: this.shop.ClientId,
        clientSecret: this.shop.ClientSecret
      }
      verifyAPI(obj).then(res => {
        this.cdiscountShop.token = res.data.accessToken
        this.cdiscountShop.expiresTime = res.data.expiresTime
        this.shop.message.text = '该店铺已授权,令牌过期时间' + res.data.expiresTime
        this.isVerifyAPI = true
        this.alertMessage(res.message, 'success')
      }).catch(error => {
        this.loading.close()
        if (error.request) {
          const errorRes = JSON.parse(error.request.response)
          this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
        } else {
          this.alertMessage('请求失败，请联系管理员！', 'error')
        }
      })
    },
    // 获取授权令牌
    get_access_token(code) {
      // console.log(code)
      const that = this
      // 过滤非字符串类型的 响应
      if (typeof code === 'string') {
        if (code.length > 0) {
          const obj = {}
          if (this.platforms[this.platform].value === 'amazon') {
            obj['country'] = this.amazonShop.country
          }
          if (['wish', 'mercado', 'allegro', 'joom', 'cdiscount'].includes(this.platforms[this.platform].value)) {
            obj['platform'] = this.platforms[this.platform].text
            obj['clientId'] = this.shop.ClientId
            obj['clientSecret'] = this.shop.ClientSecret
            obj['code'] = code
          } else {
            obj['client_id'] = this.shop.ClientId
            obj['client_secret'] = this.shop.ClientSecret
            obj['grant_type'] = 'authorization_code'
            obj['code'] = code
            obj['redirect_uri'] = this.shop.RedirectURI
          }
          getAccessToken(this.platforms[this.platform].token, 'get', obj)
            .then((msg) => {
              var data
              if (msg.code === 200) {
                data = msg.data
              } else {
                data = msg
              }
              // console.log(msg)
              this.iframedialog = false
              if (parseInt(data.code) === 0 || data['accessToken'] || data.success) {
                if (this.platforms[this.platform].value === 'aliexpress') {
                  that.shop.accessToken = data['access_token']
                  that.shop.refreshToken = data['refresh_token']
                  that.shop.lastDate = that.dateFormat(new Date())
                } else if (this.platforms[this.platform].value === 'wish') {
                  that.shop.accessToken = data['accessToken']
                  that.shop.refreshToken = data['refreshToken']
                  that.wishShop.expiresInTime = data['expiresTime']
                  that.shop.message.text = '获取广告API授权令牌成功!请点击保存,保存令牌'
                  this.shop.message.color = 'green'
                } else if (this.platforms[this.platform].value === 'joom') {
                  that.shop.accessToken = data['accessToken']
                  that.shop.refreshToken = data['refreshToken']
                  that.joomShop.expiresInTime = data['expiresTime']
                  that.shop.message.text = '获取广告API授权令牌成功!请点击保存,保存令牌'
                  this.shop.message.color = 'green'
                } else if (this.platforms[this.platform].value === 'lazada') {
                  that.shop.accessToken = data['access_token']
                  that.shop.refreshToken = data['refresh_token']
                  that.lazadaShop.accountPlatform = data['account_platform']
                  that.lazadaShop.account = data['account']
                  that.lazadaShop.countryUserInfo = JSON.stringify(
                    data['country_user_info']
                  )
                  const refresh_expires_in_date = new Date()
                  refresh_expires_in_date.setSeconds(
                    refresh_expires_in_date.getSeconds() + data['expires_in']
                  )
                  that.lazadaShop.refreshExpiresIn = that.dateFormat(
                    refresh_expires_in_date
                  )
                } else if (this.platforms[this.platform].value === 'allegro') {
                  that.shop.accessToken = data['accessToken']
                  that.shop.refreshToken = data['refreshToken']
                  that.allegroShop.expiresInTime = data['expiresTime']
                  that.shop.message.text =
                    '获取广告API授权令牌成功!请点击保存,保存令牌'
                  this.shop.message.color = 'green'
                } else if (this.platforms[this.platform].value === 'amazon') {
                  that.shop.accessToken = data['access_token']
                  that.shop.refreshToken = data['refresh_token']
                  that.shop.lastDate = that.dateFormat(new Date())
                  that.shop.message.text =
                    '获取广告API授权令牌成功!请点击保存,保存令牌'
                  this.shop.message.color = 'green'
                } else if (this.platforms[this.platform].value === 'mercado') {
                  that.shop.accessToken = data['accessToken']
                  that.shop.refreshToken = data['refreshToken']
                  that.mercadoShop.expiresInTime = data['expiresTime']
                  that.shop.message.text = '获取广告API授权令牌成功!请点击保存,保存令牌'
                  this.shop.message.color = 'green'
                } else if (this.platforms[this.platform].value === 'cdiscount') {
                  that.cdiscountShop.token = data['accessToken']
                  that.shop.refreshToken = data['refreshToken']
                  that.cdiscountShop.expiresInTime = data['expiresTime']
                  that.shop.message.text = '获取广告API授权令牌成功!请点击保存,保存令牌'
                  this.shop.message.color = 'green'
                  this.isVerifyAPI = true
                }
                this.frameSrc = ''
                // $("#iframe").attr("src", "");
                // $("#myModal").modal("hide");
                this.alertMessage(
                  '获取授权令牌成功!请点击保存,保存令牌',
                  'success'
                )
              } else {
                setTimeout(() => {
                  this.alertMessage(`获取授权令牌失败,code: ${msg.code ? msg.code : data.code}, message: ${msg.message ? msg.message : data.message}`, 'error')
                  this.frameSrc = ''
                  // $("#iframe").attr("src", "");
                  // $("#myModal").modal("hide");
                }, 2500)
              }
            })
        } else {
          this.alertMessage('获取用户授权码失败!', 'error')
        }
      }
    },
    // 添加库存信息
    save() {
      if (
        this.shop.errorMsg !== undefined &&
        this.shop.errorMsg !== null &&
        this.shop.errorMsg.trim() === '该店铺序号已经存在!'
      ) {
        this.alertMessage('店铺序号已存在,请重新输入', 'error')
        return
      }
      if (this.shop.minSaleVolume === '' && ['amazon', 'shopee'].includes(this.platforms[this.platform].value)) {
        this.alertMessage('请填写业绩维护线', 'error')
        return
      } else if (this.shop.profitCurveLine === '' && ['amazon', 'shopee'].includes(this.platforms[this.platform].value)) {
        this.alertMessage('请填写利润提成线', 'error')
        return
      } else if (this.shop.number === '') {
        this.alertMessage('请填写店铺序号', 'error')
        return
      } else if (this.shop.name === '') {
        this.alertMessage('请填写店铺名称', 'error')
        return
      } else if (this.shop.shopAdmin === '') {
        this.alertMessage('请选择店铺负责人', 'error')
        return
      }

      if (this.platforms[this.platform].value === 'wish') {
        // 数据验证
        if (this.shop.ClientSecret === '') {
          this.alertMessage('请输入Client Secret', 'error')
        } else if (this.shop.RedirectURI === '') {
          this.alertMessage('请输入Redirect URI', 'error')
        } else if (this.shop.accessToken === '') {
          this.alertMessage('未获取令牌无法保存', 'error')
        } else if (this.shop.refreshToken === '') {
          this.alertMessage('未获取令牌无法保存', 'error')
        } else if (this.wishShop.commissionRate === '') {
          this.alertMessage('未填写佣金无法保存', 'error')
        } else if (this.wishShop.siteId === '') {
          this.alertMessage('未选择站点无法保存', 'error')
        } else {
          Object.assign(this.shop, this.wishShop)

          const obj = {
            id: this.shop.id,
            shopId: this.shop.shopId,
            shopNumber: this.shop.number,
            shopName: this.shop.name,
            staffId: this.shop.shopAdmin,
            changeDate: this.shop.time,
            accessToken: this.shop.accessToken,
            refreshToken: this.shop.refreshToken,
            clientId: this.shop.ClientId,
            clientSecret: this.shop.ClientSecret,
            redirectUri: this.shop.RedirectURI,
            platform: 'Wish',
            siteId: this.shop.siteId,
            commissionRate: this.shop.commissionRate,
            expiresTime: this.shop.expiresTime
          }

          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          let requestUrl = this.platforms[this.platform].add_uri
          let requestMethod = 'post'
          // isAddOrEdit === true 表示编辑（更新）
          if (this.isAddOrEdit) { // 编辑状态
            obj['id'] = this.shop.id
            requestUrl = this.platforms[this.platform].update_uri
            requestMethod = 'put'
          }
          // 佣金比例的拦截
          this.regExp.lastIndex = 0
          if (!this.regExp.test(this.wishShop.commissionRate)) {
            this.alertMessage('佣金比例为：大于0小于1的小数，请修改！', 'error')
            return
          }
          // console.log(JSON.stringify(obj))
          saveShopByYuanmei(requestUrl, requestMethod, obj).then((msg) => {
            this.wishDialog = false
            this.loading.close()
            this.search()
            this.alertMessage(msg.data, 'success')
          })
            .catch(error => {
              this.loading.close()
              if (error.request) {
                const errorRes = JSON.parse(error.request.response)
                this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
              } else {
                this.alertMessage('请求失败，请联系管理员！', 'error')
              }
            })
        }
      } else if (this.platforms[this.platform].value === 'amazon') {
        // 数据验证
        if (this.amazonShop.country === '') {
          this.alertMessage('请选择国家', 'error')
        } else if (this.amazonShop.currency === '') {
          this.alertMessage('请选择币种', 'error')
        } else {
          Object.assign(this.shop, this.amazonShop)

          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          const obj = {
            id: this.shop.id,
            shopNumber: this.shop.number,
            shopName: this.shop.name,
            country: this.shop.country,
            currency: this.shop.currency,
            staffId: this.shop.shopAdmin,
            sellerId: this.shop.sellerNumber,
            mwsAuthToken: this.shop.amazonToken,
            changeTime: this.shop.time,
            minSaleVolume: this.shop.minSaleVolume,
            profitCurveLine: this.shop.profitCurveLine
          }
          if (
            this.shop.accessToken !== null &&
            this.shop.accessToken.trim() !== ''
          ) {
            obj['adAccessToken'] = this.shop.accessToken
            obj['adRefreshToken'] = this.shop.refreshToken
            obj['adTokenType'] = 'bearer'
            obj['expiresIn'] = this.shop.lastDate
          }
          saveShop(this.platforms[this.platform].save_uri, { obj: JSON.stringify(obj) })
            .then((msg) => {
              this.amazonDialog = false
              this.loading.close()
              this.search()
              if (msg.success) {
                this.alertMessage(msg.msg, 'success')
              } else {
                this.alertMessage(msg.msg, 'error')
              }
              this.initTable()
            })
            .catch(() => {
              this.amazonDialog = false
              this.loading.close()
              this.alertMessage('请求失败！', 'error')
            })
        }
      } else if (this.platforms[this.platform].value === 'joom') {
        // 数据验证
        if (this.shop.ClientId === '') {
          this.alertMessage('请输入Client Id', 'error')
        } else if (this.shop.ClientSecret === '') {
          this.alertMessage('请输入Client Secret', 'error')
        } else if (this.shop.RedirectURI === '') {
          this.alertMessage('请输入Redirect URI', 'error')
        } else if (this.shop.accessToken === '') {
          this.alertMessage('未获取令牌无法保存', 'error')
        } else if (this.shop.refreshToken === '') {
          this.alertMessage('未获取令牌无法保存', 'error')
        } else if (this.joomShop.commissionRate === '') {
          this.alertMessage('未填写佣金比例无法保存', 'error')
        } else if (this.joomShop.siteId === '') {
          this.alertMessage('未选择站点无法保存', 'error')
        } else {
          Object.assign(this.shop, this.joomShop)

          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          const obj = {
            id: this.shop.id,
            shopId: this.shop.shopId,
            shopNumber: this.shop.number,
            shopName: this.shop.name,
            staffId: this.shop.shopAdmin,
            accessToken: this.shop.accessToken,
            expiresTime: this.shop.expiresTime,
            refreshToken: this.shop.refreshToken,
            changeDate: this.shop.time,
            clientId: this.shop.ClientId,
            clientSecret: this.shop.ClientSecret,
            redirectUri: this.shop.RedirectURI,
            platform: 'Joom',
            siteId: this.shop.siteId,
            commissionRate: this.shop.commissionRate,
            shopGroup: this.joomShop.shopGroup
          }
          let requestUrl = this.platforms[this.platform].add_uri
          let requestMethod = 'post'
          // isAddOrEdit === true 表示编辑（更新）
          if (this.isAddOrEdit) { // 编辑状态
            obj['id'] = this.shop.id
            requestUrl = this.platforms[this.platform].update_uri
            requestMethod = 'put'
          }
          // 佣金比例的拦截
          this.regExp.lastIndex = 0
          if (!this.regExp.test(this.joomShop.commissionRate)) {
            this.alertMessage('佣金比例为：大于0小于1的小数，请修改！', 'error')
            return
          }
          // console.log(JSON.stringify(obj))
          saveShopByYuanmei(requestUrl, requestMethod, obj).then((msg) => {
            this.joomDialog = false
            this.loading.close()
            this.search()
            this.alertMessage(msg.data, 'success')
          })
            .catch(error => {
              this.loading.close()
              if (error.request) {
                const errorRes = JSON.parse(error.request.response)
                this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
              } else {
                this.alertMessage('请求失败，请联系管理员！', 'error')
              }
            })
        }
      } else if (this.platforms[this.platform].value === 'aliexpress') {
        // 数据验证
        if (this.aliexpressShop.country === '') {
          this.alertMessage('请选择国家', 'error')
        } else {
          Object.assign(this.shop, this.aliexpressShop)

          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          const obj = {
            id: this.shop.id,
            shopNumber: this.shop.number,
            shopName: this.shop.name,
            country: this.shop.country,
            currency: this.shop.currency,
            staffId: this.shop.shopAdmin,
            sellerId: this.shop.sellerNumber,
            mwsAuthToken: this.shop.aliexpressToken,
            changeTime: this.shop.time,
            minSaleVolume: this.shop.minSaleVolume,
            profitCurveLine: this.shop.profitCurveLine,
            profitRatio: this.shop.profitRatio,
            minProfit: this.shop.minProfit,
            maxProfit: this.shop.profitCurveLine
          }
          if (
            this.shop.accessToken !== null &&
            this.shop.accessToken.trim() !== ''
          ) {
            obj['adAccessToken'] = this.shop.accessToken
            obj['adRefreshToken'] = this.shop.refreshToken
            obj['adTokenType'] = 'bearer'
            obj['expiresIn'] = this.shop.lastDate
          }
          saveShop(this.platforms[this.platform].save_uri, { obj: JSON.stringify(obj) }).then((msg) => {
            this.aliexpressDialog = false
            this.loading.close()
            this.search()
            if (msg.success) {
              this.alertMessage(msg.msg, 'success')
            } else {
              this.alertMessage(msg.msg, 'error')
            }
            this.initTable()
          })
            .catch(() => {
              this.aliexpressDialog = false
              this.loading.close()
              this.alertMessage('请求失败！', 'error')
            })
        }
      } else if (this.platforms[this.platform].value === 'shopee') {
        // 数据验证
        if (this.shopeeShop.shopSite === '') {
          this.alertMessage('请选择店铺站点', 'error')
        } else if (this.shopeeShop.shopIDShopee === '') {
          this.alertMessage('请输入shopID', 'error')
        } else if (this.shopeeShop.partnerIdShopee === '') {
          this.alertMessage('请输入partnerId', 'error')
        } else if (this.shopeeShop.secretKey === '') {
          this.alertMessage('请输入secretKey', 'error')
        } else {
          Object.assign(this.shop, this.shopeeShop)

          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          const obj = {
            id: this.shop.id,
            shopNumber: this.shop.number,
            shopSite: this.shop.shopSite,
            staffId: this.shop.shopAdmin,
            shopId: this.shop.shopIDShopee,
            partnerId: this.shop.partnerIdShopee,
            secretKey: this.shop.secretKey,
            profitRatio: this.shop.profit,
            changeTime: this.shop.time,
            minSaleVolume: this.shop.minSaleVolume,
            profitCurveLine: this.shop.profitCurveLine,
            shopType: this.shopeeShopType,
            parentShopId: this.parentShopIdShopee
            // currency:"",
            // staff:""
          }
          // console.log(obj)
          saveShop(this.platforms[this.platform].save_uri, { obj: JSON.stringify(obj) }).then((msg) => {
            this.shopeeDialog = false
            this.loading.close()
            this.search()
            if (msg.success) {
              this.alertMessage(msg.msg, 'success')
            } else {
              this.alertMessage(msg.msg, 'error')
            }
          })
            .catch(() => {
              this.shopeeDialog = false
              this.loading.close()
              this.alertMessage('请求失败！', 'error')
            })
        }
      } else if (this.platforms[this.platform].value === 'mall') {
        // 数据验证
        if (this.shop.ClientId === '') {
          this.alertMessage('请输入Client Id', 'error')
        } else if (this.shop.ClientSecret === '') {
          this.alertMessage('请输入Client Secret', 'error')
        } else {
          Object.assign(this.shop, this.mallShop)

          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          const obj = {
            id: this.shop.id,
            shopNumber: this.shop.number,
            shopName: this.shop.name,
            staffId: this.shop.shopAdmin,
            profitRatio: this.shop.profit,
            changeTime: this.shop.time,
            clientId: this.shop.ClientId,
            clientSecret: this.shop.ClientSecret,
            minSaleVolume: this.shop.minSaleVolume,
            profitCurveLine: this.shop.profitCurveLine,
            shopUsername: this.shop.shopUserName,
            shopPassword: this.shop.shopPassword
          }
          saveShop(this.platforms[this.platform].save_uri, { obj: JSON.stringify(obj) }).then((msg) => {
            this.mallDialog = false
            this.loading.close()
            this.search()
            if (msg.success) {
              this.alertMessage(msg.msg, 'success')
            } else {
              this.alertMessage(msg.msg, 'error')
            }
          })
            .catch(() => {
              this.mallDialog = false
              this.loading.close()
              this.alertMessage('请求失败！', 'error')
            })
        }
      } else if (this.platforms[this.platform].value === 'lazada') {
        // 数据验证
        if (this.lazadaShop.country.length === 0) {
          this.alertMessage('请选择国家', 'error')
        } else if (
          this.lazadaShop.country.length === 1 &&
          this.shop.currency === ''
        ) {
          this.alertMessage('请选择币种', 'error')
        } else {
          Object.assign(this.shop, this.lazadaShop)

          if (this.shop.country.length > 1) {
            if (
              (this.shop.id === undefined || this.shop.id === '') &&
              this.shop.number.indexOf('-') !== -1
            ) {
              this.alertMessage('店铺序号不能包括-', 'error')
              return
            }
          }
          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          var countrys = ''
          if (this.isMultiple) {
            countrys = this.shop.country.join()
          } else {
            countrys = this.shop.country
          }
          const obj = {
            id: this.shop.id,
            shopNumber: this.shop.number,
            shopName: this.shop.name,
            country: countrys,
            currency: this.shop.currency,
            staffId: this.shop.shopAdmin,
            accessToken: this.shop.accessToken,
            refreshToken: this.shop.refreshToken,
            accountPlatform: this.shop.accountPlatform,
            account: this.shop.account,
            countryUserInfo: this.shop.countryUserInfo,
            refreshExpiresIn: this.shop.refreshExpiresIn,
            changeTime: this.shop.time,
            minSaleVolume: this.shop.minSaleVolume,
            profitCurveLine: this.shop.profitCurveLine
          }
          saveShop(this.platforms[this.platform].save_uri, { obj: JSON.stringify(obj) }).then((msg) => {
            this.lazadaDialog = false
            this.loading.close()
            this.search()
            if (msg.success) {
              this.alertMessage(msg.msg, 'success')
            } else {
              this.alertMessage(msg.msg, 'error')
            }
          })
            .catch(() => {
              this.lazadaDialog = false
              this.loading.close()
              this.alertMessage('请求失败！', 'error')
            })
        }
      } else if (this.platforms[this.platform].value === 'allegro') {
        // 数据验证
        if (this.shop.accessToken === '') {
          this.alertMessage('未获取令牌无法保存', 'error')
        } else if (this.shop.refreshToken === '') {
          this.alertMessage('未获取令牌无法保存', 'error')
        } else if (this.allegroShop.commissionRate === '') {
          this.alertMessage('请输入佣金比例', 'error')
        } else {
          Object.assign(this.shop, this.allegroShop)

          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          const obj = {
            id: this.shop.id,
            shopName: this.shop.name,
            shopNumber: this.shop.number,
            staffId: this.shop.shopAdmin,
            clientId: this.shop.ClientId,
            clientSecret: this.shop.ClientSecret,
            redirectUri: this.shop.RedirectURI,
            accessToken: this.shop.accessToken,
            // tokenType: this.allegroShop.tokenType,
            refreshToken: this.shop.refreshToken,
            // expiresIn: this.allegroShop.expiresIn,
            expiresTime: this.allegroShop.expiresInTime,
            // scope: this.allegroShop.scope,
            changeDate: this.shop.time,
            commissionRate: this.allegroShop.commissionRate,
            platform: 'Allegro',
            siteId: this.allegroShop.siteId
          }
          let requestUrl = this.platforms[this.platform].add_uri
          let requestMethod = 'post'
          // isAddOrEdit === true 表示编辑（更新）
          if (this.isAddOrEdit) { // 编辑状态
            obj['id'] = this.shop.id
            requestUrl = this.platforms[this.platform].update_uri
            requestMethod = 'put'
          }
          // 佣金比例的拦截
          this.regExp.lastIndex = 0
          if (!this.regExp.test(this.allegroShop.commissionRate)) {
            this.alertMessage('佣金比例为：大于0小于1的小数，请修改！', 'error')
            return
          }
          // console.log(JSON.stringify(obj))
          saveShopByYuanmei(requestUrl, requestMethod, obj).then((msg) => {
            this.allegroDialog = false
            this.loading.close()
            this.search()
            this.alertMessage(msg.data, 'success')
          })
            .catch(error => {
              this.loading.close()
              if (error.request) {
                const errorRes = JSON.parse(error.request.response)
                this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
              } else {
                this.alertMessage('请求失败，请联系管理员！', 'error')
              }
            })
        }
      } else if (this.platforms[this.platform].value === 'b2w') {
        // 数据验证
        if (this.b2wShop.apiToken === '') {
          this.alertMessage('未填写API令牌', 'error')
        } else if (this.b2wShop.userName === '') {
          this.alertMessage('未填写用户邮箱', 'error')
        } else if (this.b2wShop.commissionRate === '') {
          this.alertMessage('未填写佣金比例', 'error')
        } else {
          Object.assign(this.shop, this.b2wShop)
          const obj = {
            shopName: this.shop.name,
            shopNumber: this.shop.number,
            staffId: this.shop.shopAdmin,
            changeDate: this.shop.time,
            accessToken: this.b2wShop.apiToken,
            userName: this.b2wShop.userName,
            clientId: this.b2wShop.xaccountmanagerKey,
            commissionRate: this.b2wShop.commissionRate,
            platform: 'B2w',
            siteId: 'BR'
          }
          let requestUrl = this.platforms[this.platform].add_uri
          let requestMethod = 'post'
          // isAddOrEdit === true 表示编辑（更新）
          if (this.isAddOrEdit) { // 编辑状态
            obj['id'] = this.shop.id
            requestUrl = this.platforms[this.platform].update_uri
            requestMethod = 'put'
          }
          // 佣金比例的拦截
          this.regExp.lastIndex = 0
          if (!this.regExp.test(this.b2wShop.commissionRate)) {
            this.alertMessage('佣金比例为：大于0小于1的小数，请修改！', 'error')
            return
          }
          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          // console.log(obj)
          // console.log(JSON.stringify(obj))
          saveShopByYuanmei(requestUrl, requestMethod, obj).then((msg) => {
            this.b2wDialog = false
            this.loading.close()
            this.search()
            this.alertMessage(msg.data, 'success')
          })
            .catch(error => {
              this.loading.close()
              if (error.request) {
                const errorRes = JSON.parse(error.request.response)
                this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
              } else {
                this.alertMessage('请求失败，请联系管理员！', 'error')
              }
            })
        }
      } else if (this.platforms[this.platform].value === 'mercado') {
        // 数据验证
        if (this.shop.accessToken === '') {
          this.alertMessage('未获取令牌无法保存', 'error')
        } else if (this.shop.refreshToken === '') {
          this.alertMessage('未获取令牌无法保存', 'error')
        } else if (this.mercadoShop.commissionRate === '') {
          this.alertMessage('未填写佣金比例', 'error')
        } else {
          Object.assign(this.shop, this.wishShop)
          const obj = {
            shopName: this.shop.name,
            shopNumber: this.shop.number,
            accessToken: this.shop.accessToken,
            refreshToken: this.shop.refreshToken,
            sellerId: this.mercadoShop.sellerId,
            expiresTime: this.mercadoShop.expiresInTime,
            commissionRate: this.mercadoShop.commissionRate,
            clientId: this.shop.ClientId,
            clientSecret: this.shop.ClientSecret,
            redirectUri: this.shop.RedirectURI,
            staffId: this.shop.shopAdmin,
            changeDate: this.shop.time,
            platform: 'Mercado',
            siteId: 'AR'
          }
          let requestUrl = this.platforms[this.platform].add_uri
          let requestMethod = 'post'
          // isAddOrEdit === true 表示编辑（更新）
          if (this.isAddOrEdit) { // 编辑状态
            obj['id'] = this.shop.id
            requestUrl = this.platforms[this.platform].update_uri
            requestMethod = 'put'
          }
          // 佣金比例的拦截
          this.regExp.lastIndex = 0
          if (!this.regExp.test(this.mercadoShop.commissionRate)) {
            this.alertMessage('佣金比例为：大于0小于1的小数，请修改！', 'error')
            return
          }
          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          // console.log(JSON.stringify(obj))
          saveShopByYuanmei(requestUrl, requestMethod, obj).then((msg) => {
            this.mercadoDialog = false
            this.loading.close()
            this.search()
            this.alertMessage(msg.data, 'success')
          })
            .catch(error => {
              this.loading.close()
              if (error.request) {
                const errorRes = JSON.parse(error.request.response)
                this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
              } else {
                this.alertMessage('请求失败，请联系管理员！', 'error')
              }
            })
        }
      } else if (this.platforms[this.platform].value === 'kaufland') {
        // if (this.shop.name === '') {
        //   this.alertMessage('请填写店铺名称', 'error')
        // } else
        if (this.shop.ClientId === '') {
          this.alertMessage('请输入ClientId', 'error')
        } else if (this.shop.ClientSecret === '') {
          this.alertMessage('请输入Client Secret', 'error')
        } else if (this.kauflandShop.commissionRate === '') {
          this.alertMessage('请输入佣金比例', 'error')
        } else {
          //  保存请求...
          const obj = {
            shopName: this.shop.name,
            shopNumber: this.shop.number,
            clientId: this.shop.ClientId,
            clientSecret: this.shop.ClientSecret,
            redirectUri: this.shop.RedirectURI,
            staffId: this.shop.shopAdmin,
            changeDate: this.shop.time,
            commissionRate: this.kauflandShop.commissionRate,
            platform: 'Kaufland',
            siteId: 'DE'
          }
          let requestUrl = this.platforms[this.platform].add_uri
          let requestMethod = 'post'
          // isAddOrEdit === true 表示编辑（更新）
          if (this.isAddOrEdit) { // 编辑状态
            obj['id'] = this.shop.id
            requestUrl = this.platforms[this.platform].update_uri
            requestMethod = 'put'
          }
          // 佣金比例的拦截
          this.regExp.lastIndex = 0
          if (!this.regExp.test(this.kauflandShop.commissionRate)) {
            this.alertMessage('佣金比例为：大于0小于1的小数，请修改！', 'error')
            return
          }
          //  保存请求...
          this.loading = this.$loading({
            lock: true,
            text: '正在保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
          // console.log(JSON.stringify(obj))
          saveShopByYuanmei(requestUrl, requestMethod, obj).then((msg) => {
            this.kauflandDialog = false
            this.loading.close()
            this.search()
            this.alertMessage(msg.data, 'success')
          }).catch(error => {
            this.loading.close()
            if (error.request) {
              const errorRes = JSON.parse(error.request.response)
              this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
            } else {
              this.alertMessage('请求失败，请联系管理员！', 'error')
            }
          })
        }
      } else if (this.platforms[this.platform].value === 'walmart') {
        if (this.walmartShop.commissionRate === '') {
          this.alertMessage('请输入佣金比例', 'error')
          return
        }

        const obj = {
          shopName: this.shop.name,
          shopNumber: this.shop.number,
          clientId: this.shop.ClientId,
          clientSecret: this.shop.ClientSecret,
          staffId: this.shop.shopAdmin,
          changeDate: this.shop.time,
          commissionRate: this.walmartShop.commissionRate,
          platform: 'Walmart',
          siteId: 'US'
        }
        let requestUrl = this.platforms[this.platform].add_uri
        let requestMethod = 'post'
        // isAddOrEdit === true 表示编辑（更新）
        if (this.isAddOrEdit) { // 编辑状态
          obj['id'] = this.shop.id
          requestUrl = this.platforms[this.platform].update_uri
          requestMethod = 'put'
        }
        // 佣金比例的拦截
        this.regExp.lastIndex = 0
        if (!this.regExp.test(this.walmartShop.commissionRate)) {
          this.alertMessage('佣金比例为：大于0小于1的小数，请修改！', 'error')
          return
        }
        //  保存请求...
        this.loading = this.$loading({
          lock: true,
          text: '正在保存中',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        // console.log(JSON.stringify(obj))
        saveShopByYuanmei(requestUrl, requestMethod, obj).then(msg => {
          this.walmartDialog = false
          this.loading.close()
          this.search()
          this.alertMessage(msg.data, 'success')
        }).catch(error => {
          this.loading.close()
          if (error.request) {
            const errorRes = JSON.parse(error.request.response)
            this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
          } else {
            this.alertMessage('请求失败，请联系管理员！', 'error')
          }
        })
      } else if (this.platforms[this.platform].value === 'coupang') {
        if (this.shop.ClientId === '') {
          this.alertMessage('请输入ClientId', 'error')
          return
        } else if (this.shop.ClientSecret === '') {
          this.alertMessage('请输入Client Secret', 'error')
          return
        } else if (this.coupangShop.sellerNumber === '') {
          this.alertMessage('请输入卖家ID', 'error')
          return
        } else if (this.coupangShop.commissionRate === '') {
          this.alertMessage('请输入佣金比例', 'error')
          return
        }
        const obj = {
          shopName: this.shop.name,
          shopNumber: this.shop.number,
          clientId: this.shop.ClientId,
          clientSecret: this.shop.ClientSecret,
          staffId: this.shop.shopAdmin,
          sellerId: this.coupangShop.sellerNumber,
          commissionRate: this.coupangShop.commissionRate,
          changeDate: this.shop.time,
          platform: 'Coupang',
          siteId: 'BR'
        }
        let requestUrl = this.platforms[this.platform].add_uri
        let requestMethod = 'post'
        // isAddOrEdit === true 表示编辑（更新）
        if (this.isAddOrEdit) { // 编辑状态
          obj['id'] = this.shop.id
          requestUrl = this.platforms[this.platform].update_uri
          requestMethod = 'put'
        }
        // 佣金比例的拦截
        this.regExp.lastIndex = 0
        if (!this.regExp.test(this.coupangShop.commissionRate)) {
          this.alertMessage('佣金比例为：大于0小于1的小数，请修改！', 'error')
          return
        }
        //  保存请求...
        this.loading = this.$loading({
          lock: true,
          text: '正在保存中',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        saveShopByYuanmei(requestUrl, requestMethod, obj).then(msg => {
          this.coupangDialog = false
          this.loading.close()
          this.search()
          this.alertMessage(msg.data, 'success')
        }).catch(error => {
          this.loading.close()
          if (error.request) {
            const errorRes = JSON.parse(error.request.response)
            this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
          } else {
            this.alertMessage('请求失败，请联系管理员！', 'error')
          }
        })
      } else if (this.platforms[this.platform].value === 'linio') {
        if (this.linioShop.userName === '') {
          this.alertMessage('请输入userName', 'error')
          return
        } else if (this.shop.ClientSecret === '') {
          this.alertMessage('请输入Client Secret', 'error')
          return
        } else if (this.linioShop.siteId === '') {
          this.alertMessage('请选择站点', 'error')
          return
        } else if (this.linioShop.commissionRate === '') {
          this.alertMessage('请输入佣金比例', 'error')
          return
        }
        const obj = {
          shopName: this.shop.name,
          shopNumber: this.shop.number,
          clientSecret: this.shop.ClientSecret,
          staffId: this.shop.shopAdmin,
          userName: this.linioShop.userName,
          commissionRate: this.linioShop.commissionRate,
          changeDate: this.shop.time,
          platform: 'Linio',
          siteId: this.linioShop.siteId
        }
        let requestUrl = this.platforms[this.platform].add_uri
        let requestMethod = 'post'
        // isAddOrEdit === true 表示编辑（更新）
        if (this.isAddOrEdit) { // 编辑状态
          obj['id'] = this.shop.id
          requestUrl = this.platforms[this.platform].update_uri
          requestMethod = 'put'
        }

        // 佣金比例的拦截
        // lastIndex 属性重置为 0, (下次匹配的起始位置, 此属性必须在全局匹配(g)下生效)
        this.regExp.lastIndex = 0
        if (!this.regExp.test(this.linioShop.commissionRate)) {
          this.alertMessage('佣金比例为：大于0小于1的小数，请修改！', 'error')
          return
        }
        //  保存请求...
        this.loading = this.$loading({
          lock: true,
          text: '正在保存中',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        saveShopByYuanmei(requestUrl, requestMethod, obj).then(msg => {
          this.linioDialog = false
          this.loading.close()
          this.search()
          this.alertMessage(msg.data, 'success')
        }).catch(error => {
          this.loading.close()
          if (error.request) {
            const errorRes = JSON.parse(error.request.response)
            this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
          } else {
            this.alertMessage('请求失败，请联系管理员！', 'error')
          }
        })
      } else if (this.platforms[this.platform].value === "cdiscount") {
            if (this.shop.ClientId === '') {
                this.alertMessage("请输入API账号", "error");
                return;
            } else if (this.shop.ClientSecret === '') {
                this.alertMessage("请输入API密码", "error");
                return;
            } else if (this.cdiscountShop.siteId === '') {
                this.alertMessage("请选择站点", "error");
                return;
            } else if (this.cdiscountShop.commissionRate === '') {
                this.alertMessage("请输入佣金比例", "error");
                return;
            }
            const obj = {
                shopName: this.shop.name,
                shopNumber: this.shop.number,
                clientId: this.shop.ClientId,
                clientSecret: this.shop.ClientSecret,
                staffId: this.shop.shopAdmin,
                accessToken: this.cdiscountShop.token,
                refreshToken: this.shop.refreshToken,
                expiresTime: this.cdiscountShop.expiresTime,
                commissionRate: this.cdiscountShop.commissionRate,
                changeDate: this.shop.time,
                platform: "Cdiscount",
                siteId: this.cdiscountShop.siteId
            };
            let requestUrl = this.platforms[this.platform].add_uri
            let requestMethod = 'post'
            // isAddOrEdit === true 表示编辑（更新）
            if (this.isAddOrEdit) { // 编辑状态
                obj['id'] = this.shop.id;
                requestUrl = this.platforms[this.platform].update_uri
                requestMethod = 'put'

                // 当前的api信息
                let currentAPIMsg = {
                    ClientId: this.shop.ClientId,
                    ClientSecret: this.shop.ClientSecret
                }
                // 判断api信息是否更改
                this.isVerifyAPI = JSON.stringify(this.cdiscountShop.apiMsg) === JSON.stringify(currentAPIMsg)
            }

            // 佣金比例的拦截
            this.regExp.lastIndex = 0; // lastIndex 属性重置为 0, (下次匹配的起始位置, 此属性必须在全局匹配(g)下生效)
            if (!this.regExp.test(this.cdiscountShop.commissionRate)) {
                this.alertMessage("佣金比例为：大于0小于1的小数，请修改！", "error");
                return
            }
            // api账号密码的验证
            if (!this.isVerifyAPI) {
                this.alertMessage("请先进行API授权！", "error");
                return
            }
            // //  保存请求...
            this.loading = this.$loading({
                lock: true,
                text: '正在保存中',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            // console.log(JSON.stringify(obj))
            saveShopByYuanmei(requestUrl, requestMethod, obj).then(msg => {
                this.cdiscountDialog = false
                this.loading.close()
                this.search()
                this.alertMessage(msg.data, 'success')
            }).catch(error => {
                this.loading.close()
                if (error.request) {
                    const errorRes = JSON.parse(error.request.response)
                    this.alertMessage(`code: ${errorRes.code ? errorRes.code : error.request.status}, message: ${errorRes.message ? errorRes.message : error.request.response}`, 'error')
                } else {
                    this.alertMessage('请求失败，请联系管理员！', 'error')
                }
            }) 
        }
    },
    editsBtn() {
      if (this.row.length === 0) {
        this.alertMessage('请选择数据！', 'error')
      } else {
        this.editsDialog = true
      }
    },
    // 佣金比例触发
    oninput(e) {
      const reg = /^0\.[0-9]\d*$/g
      if (reg.test(e.target.value)) {
        return e.target.value
      } else {
        this.alertMessage('请输入大于0小于1的小数！', 'error')
      }
    },
    // 添加监听事件
    initWindow() {
      window.addEventListener(
        'message',
        (e) => {
          const code = e.data
          if (['wish', 'joom', 'lazada', 'allegro', 'aliexpress', 'mercado'].includes(this.platforms[this.platform].value)) {
            this.get_access_token(code)
          } else if (this.platforms[this.platform].value === 'shopee') {
            if (
              code !== undefined &&
              code.length > 0 &&
              parseInt(code) !== '-1'
            ) {
              this.shopeeShop.shopIDShopee = code
              this.alertMessage(
                '获取店铺ID成功!请点击保存,保存令牌',
                'success'
              )
              this.frameSrc = ''
              // $("#iframe").attr("src", "");
              // $("#myModal").modal("hide");
            } else {
              setTimeout(() => {
                this.alertMessage('获取用户授权码失败!', 'error')
                this.frameSrc = ''
                // $("#iframe").attr("src", "");
                // $("#myModal").modal("hide");
              }, 2500)
            }
          } else if (this.platforms[this.platform].value === 'amazon') {
            if (
              code !== undefined &&
              code.length > 0 &&
              parseInt(code) !== -1
            ) {
              this.get_access_token(code)
            } else {
              setTimeout(() => {
                this.$alert('获取广告API授权码失败!', '提示', {
                  confirmButtonText: '确定'
                })
              }, 3000)
            }
          }
        },
        false
      )
    },
    // 限制只能输入数字且最多保留2位小数
    inputLimit(name) {
      if (name === 'minSaleVolume') {
        this.shop.minSaleVolume = this.shop.minSaleVolume.replace(
          /[^\d.]/g,
          ''
        ) // 仅保留数字和"."
        this.shop.minSaleVolume = this.shop.minSaleVolume.replace(
          /\.{2,}/g,
          '.'
        ) // 两个连续的"."仅保留第一个"."
        this.shop.minSaleVolume = this.shop.minSaleVolume
          .replace('.', '$#*')
          .replace(/\./g, '')
          .replace('$#*', '.') // 去除其他"."
        this.shop.minSaleVolume = this.shop.minSaleVolume.replace(
          /^(\d+)\.(\d\d).*$/,
          '$1.$2'
        ) // 限制只能输入两个小数
        if (
          this.shop.minSaleVolume.indexOf('.') < 0 &&
          this.shop.minSaleVolume !== ''
        ) {
          // 首位是0的话去掉
          this.shop.minSaleVolume = parseFloat(this.shop.minSaleVolume)
        }
      } else if (name === 'profitCurveLine') {
        this.shop.profitCurveLine = this.shop.profitCurveLine.replace(
          /[^\d.]/g,
          ''
        ) // 仅保留数字和"."
        this.shop.profitCurveLine = this.shop.profitCurveLine.replace(
          /\.{2,}/g,
          '.'
        ) // 两个连续的"."仅保留第一个"."
        this.shop.profitCurveLine = this.shop.profitCurveLine
          .replace('.', '$#*')
          .replace(/\./g, '')
          .replace('$#*', '.') // 去除其他"."
        this.shop.profitCurveLine = this.shop.profitCurveLine.replace(
          /^(\d+)\.(\d\d).*$/,
          '$1.$2'
        ) // 限制只能输入两个小数
        if (
          this.shop.profitCurveLine.indexOf('.') < 0 &&
          this.shop.profitCurveLine !== ''
        ) {
          // 首位是0的话去掉
          this.shop.profitCurveLine = parseFloat(this.shop.profitCurveLine)
        }
      }
    },
    // 防止输入法失焦bug校验
    checkInput(event) {
      if (event.target.placeholder === '请填写业绩维护线') {
        var reg = /^(\.*)(\d+)(\.?)(\d{0,2}).*$/g
        if (!reg.test(event.target.value)) {
          this.shop.minSaleVolume = ''
        }
      } else if (event.target.placeholder === '请填写利润提成线') {
        reg = /^(\.*)(\d+)(\.?)(\d{0,2}).*$/g
        if (!reg.test(event.target.value)) {
          this.shop.profitCurveLine = ''
        }
      }
    },
    // 根据平台获取站点
    getPlatformSite(platform) {
      getPlatformSite(platform).then(res => {
        const obj = {
          Linio: 'linioShop',
          Cdiscount: 'cdiscountShop',
          Allegro: 'allegroShop',
          Joom: 'joomShop',
          Wish: 'wishShop'
        }
        if (this[obj[platform]].shopSite !== undefined) {
          this[obj[platform]].shopSite = res.data
        }
        // 只有一个站点时默认选中
        if (res.data && res.data.length === 1) {
          res.data.forEach(item => {
            this[obj[platform]].siteId = item.siteId
            this[obj[platform]].disabled = true
          })
        }
      })
    },
    testMethod() {
      this.dialogVisible = true
    },
    closeShopMsg(flag) {
      this.dialogVisible = flag
    }
  }
}
</script>

<style scoped>
@import '../../../styles/shopManage/shopManage_el.css';

.el-row .cols .label {
  padding-top: 7px;
  box-sizing: border-box;
}
</style>
