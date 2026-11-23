import {test, expect} from '@playwright/test';

const boundaryFixture={
  type:'FeatureCollection',
  features:[
    {type:'Feature',id:'75',properties:{code:'75',name:'Đồng Nai',kind:'Thành phố',matched:true,tone:0,labelLng:107.1,labelLat:11.3},geometry:{type:'Polygon',coordinates:[[[106.6,10.8],[107.7,10.8],[107.7,11.8],[106.6,11.8],[106.6,10.8]]]}},
    {type:'Feature',id:'79',properties:{code:'79',name:'TP. Hồ Chí Minh',kind:'Thành phố',matched:true,tone:1,labelLng:106.5,labelLat:10.7},geometry:{type:'Polygon',coordinates:[[[106.1,10.1],[106.6,10.1],[106.6,10.6],[106.1,10.6],[106.1,10.1]]]}},
    {type:'Feature',id:'01',properties:{code:'01',name:'Hà Nội',kind:'Thành phố',matched:true,tone:2,labelLng:105.7,labelLat:21.1},geometry:{type:'Polygon',coordinates:[[[105.3,20.8],[106.2,20.8],[106.2,21.5],[105.3,21.5],[105.3,20.8]]]}},
  ],
  metadata:{geometryCount:3,expected:34,matchedCount:3,source:'QA fixture only',accuracy:'Synthetic data for interaction test, never production GIS'},
};

test.beforeEach(async ({page})=>{
  await page.route('**/api/map-boundaries?**',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(boundaryFixture)});
  });
});

test('Đồng Nai vs TP. Hồ Chí Minh: map, stats and source reference',async ({page})=>{
  await page.goto('/hoc-dia-ly?period=current&tab=compare&a=75&b=79');
  await expect(page.getByRole('heading',{name:'So sánh hai địa phương'})).toBeVisible();
  await expect(page.locator('.edu-slot-a select')).toHaveValue('75');
  await expect(page.locator('.edu-slot-b select')).toHaveValue('79');
  await expect(page.locator('.edu-comparison-row')).toHaveCount(6);
  await expect(page.getByText('12.737,18 km²')).toBeVisible();
  await expect(page.getByText('6.772,59 km²')).toBeVisible();
  await expect(page.locator('.edu-compare-provenance a').first()).toHaveAttribute('href',/https:\/\//);
  await expect(page.locator('.edu-map-canvas')).toBeVisible();
  await page.locator('.edu-slot-a select').selectOption('01');
  await expect(page.getByText('Khác loại dân số hoặc kỳ tham chiếu')).toBeVisible();
});

test('Quiz 93: right answer is Đồng Nai for current period',async ({page})=>{
  await page.goto('/hoc-dia-ly?period=current&tab=quiz');
  await expect(page.getByText('Biển số xe 93 thuộc địa phương nào')).toBeVisible();
  await page.locator('.edu-quiz-answers button').filter({hasText:'Đồng Nai'}).click();
  await expect(page.getByText('Chính xác!',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Câu tiếp theo'}).click();
  await expect(page.getByText('Thành phố Đồng Nai hiện tại được hình thành')).toBeVisible();
});

test('Mobile learning navigation and missing historical GIS disclosure',async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/hoc-dia-ly?tab=quality');
  await expect(page.getByRole('button',{name:'Kiểm chứng'})).toBeVisible();
  await expect(page.getByText('0/63')).toBeVisible();
  const dimensions=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width+1);
});
