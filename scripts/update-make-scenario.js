
// const fetch = require('node-fetch');

async function updateScenario() {
  const scenarioId = '4547638';
  const token = 'a843de35-f49b-44f3-84a6-cda3a5c81880';
  const urlGet = `https://us1.make.com/api/v2/scenarios/${scenarioId}/blueprint`;
  const urlPatch = `https://us1.make.com/api/v2/scenarios/${scenarioId}`;

  console.log('📥 Fetching Blueprint...');
  try {
    const response = await fetch(urlGet, {
      method: 'GET',
      headers: { 'Authorization': `Token ${token}` }
    });
    
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const data = await response.json();
    const blueprint = data.response.blueprint;

    // Find Module 3
    const module = blueprint.flow.find(m => m.id === 3);
    if (!module) throw new Error('Module 3 not found');

    // CORRECT URL with Token ID inserted
    const correctUrl = 'https://api.z-api.io/instances/3EDCE29A3EB0A1453F66FAF4F663B13A/token/CC91F1EC21501AFE9182A3BC/{{if(1.message.type = "text"; "send-text"; if(1.message.type = "image"; "send-image"; if(1.message.type = "audio"; "send-audio"; if(1.message.type = "video"; "send-video"; if(1.message.type = "document"; "send-document"; if(1.message.type = "link"; "send-link"; if(1.message.type = "poll"; "send-poll"; if(1.message.type = "ptv"; "send-ptv"; if(1.message.type = "location"; "send-location"; if(1.message.type = "contact"; "send-contact"; if(1.message.type = "contacts"; "send-contacts"; if(1.message.type = "button-list"; "send-button-list"; if(1.message.type = "button-list-image"; "send-button-list"; if(1.message.type = "option-list"; "send-option-list"; if(1.message.type = "product"; "send-product"; if(1.message.type = "catalog"; "send-catalog"; "send-text"))))))))))))))))}}';
    
    // RESTORE ORIGINAL BODY
    // Note: Escaping backslashes for JS string is tricky.
    // The original string has `\"` which in JS is `"`.
    // I need to produce the exact string that Make expects.
    const originalBody = '{{if(1.message.type = "image"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"image\\": \\"" + 1.message.image + "\\", \\"caption\\": \\"" + replace(ifempty(1.message.caption; ""); "\\""; "\\\\"") + "\\" }"; if(1.message.type = "video"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"video\\": \\"" + 1.message.video + "\\", \\"caption\\": \\"" + replace(ifempty(1.message.caption; ""); "\\""; "\\\\"") + "\\" }"; if(1.message.type = "audio"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"audio\\": \\"" + 1.message.audio + "\\" }"; if(1.message.type = "document"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"document\\": \\"" + 1.message.document + "\\", \\"fileName\\": \\"" + replace(ifempty(1.message.fileName; "file"); "\\""; "\\\\"") + "\\", \\"caption\\": \\"" + replace(ifempty(1.message.caption; ""); "\\""; "\\\\"") + "\\" }"; if(1.message.type = "link"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"linkUrl\\": \\"" + 1.message.linkUrl + "\\", \\"title\\": \\"" + replace(ifempty(1.message.title; ""); "\\""; "\\\\"") + "\\", \\"linkDescription\\": \\"" + replace(ifempty(1.message.linkDescription; ""); "\\""; "\\\\"") + "\\", \\"image\\": \\"" + 1.message.image + "\\" }"; if(1.message.type = "poll"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"pollName\\": \\"" + replace(ifempty(1.message.pollName; "Enquete"); "\\""; "\\\\"") + "\\", \\"pollOptions\\": [\\"" + join(1.message.pollOptions; "\",\"") + "\\"], \\"selectableOptionsCount\\": " + ifempty(1.message.selectableOptionsCount; 1) + " }"; if(1.message.type = "ptv"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"video\\": \\"" + 1.message.video + "\\" }"; if(1.message.type = "location"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"latitude\\": \\"" + 1.message.latitude + "\\", \\"longitude\\": \\"" + 1.message.longitude + "\\", \\"title\\": \\"" + replace(ifempty(1.message.title; ""); "\\""; "\\\\"") + "\\", \\"address\\": \\"" + replace(ifempty(1.message.address; ""); "\\""; "\\\\"") + "\\" }"; if(1.message.type = "contact"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"contactName\\": \\"" + replace(ifempty(1.message.contactName; ""); "\\""; "\\\\"") + "\\", \\"contactPhone\\": \\"" + 1.message.contactPhone + "\\", \\"businessDescription\\": \\"" + replace(ifempty(1.message.businessDescription; ""); "\\""; "\\\\"") + "\\" }"; if(1.message.type = "contacts"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"contacts\\": " + ifempty(1.message.contacts; "[]") + " }"; if(1.message.type = "button-list"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"message\\": \\"" + replace(ifempty(1.message.text; ""); "\\""; "\\\\"") + "\\", \\"buttonList\\": " + ifempty(1.message.buttonList; "{}") + " }"; if(1.message.type = "button-list-image"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"image\\": \\"" + 1.message.image + "\\", \\"buttonList\\": " + ifempty(1.message.buttonList; "{}") + " }"; if(1.message.type = "option-list"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"message\\": \\"" + replace(ifempty(1.message.text; ""); "\\""; "\\\\"") + "\\", \\"title\\": \\"" + replace(ifempty(1.message.title; ""); "\\""; "\\\\"") + "\\", \\"footer\\": \\"" + replace(ifempty(1.message.footer; ""); "\\""; "\\\\"") + "\\", \\"buttonText\\": \\"" + replace(ifempty(1.message.buttonText; "Options"); "\\""; "\\\\"") + "\\", \\"optionList\\": " + ifempty(1.message.optionList; "[]") + " }"; if(1.message.type = "product"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"productId\\": \\"" + 1.message.productId + "\\" }"; if(1.message.type = "catalog"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"delayMessage\\": 1, \\"message\\": \\"Catalog sending\\" }"; "{ \\"phone\\": \\"" + 1.to.phone + "\\", \\"message\\": \\"" + replace(ifempty(1.message.text; ""); "\\""; "\\\\"") + "\\" }"))))))))))))))))}}';

    module.mapper.url = correctUrl;
    module.mapper.method = "post";
    module.mapper.data = originalBody;

    console.log('✏️ Updating URL to DYNAMIC (Fixed):', correctUrl);
    console.log('✏️ Updating BODY to DYNAMIC (Restored)');

    // Push update via PATCH
    const updateResponse = await fetch(urlPatch, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ blueprint: JSON.stringify(blueprint) })
    });

    if (!updateResponse.ok) {
        const errText = await updateResponse.text();
        throw new Error(`Update failed: ${updateResponse.status} - ${errText}`);
    }

    console.log('✅ Scenario Restored & Fixed Successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateScenario();
