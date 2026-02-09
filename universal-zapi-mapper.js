const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const env = {};
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
lines.forEach(line => {
    const p = line.indexOf('=');
    if (p > 0) env[line.substring(0, p).trim()] = line.substring(p + 1).trim();
});

async function updateScenario() {
    console.log('Fetching blueprint...');
    const res = await fetch('https://us1.make.com/api/v2/scenarios/4547638/blueprint', {
        headers: { 'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP }
    });
    
    if (!res.ok) { console.error('Error'); return; }
    const data = await res.json();
    const blueprint = data.response.blueprint;
    const httpModule = blueprint.flow.find(m => m.id === 3);

    const q = "\\\""; 
    const eq = "\\\\\""; 

    // Dynamic Body Logic
    // Polls use join() to create JSON array string from Make Array
    // Contacts uses direct mapping (hoping for the best, or user must send stringified)
    
    const dynamicBody = `{{
      if(1.message.type = "text"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}message${q}: ${q}" + replace(ifempty(1.message.text; ""); "${q}"; "${eq}") + "${q} }";
      if(1.message.type = "image"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}image${q}: ${q}" + 1.message.image + "${q}, ${q}caption${q}: ${q}" + replace(ifempty(1.message.caption; ""); "${q}"; "${eq}") + "${q} }";
      if(1.message.type = "audio"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}audio${q}: ${q}" + 1.message.audio + "${q} }";
      if(1.message.type = "video"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}video${q}: ${q}" + 1.message.video + "${q}, ${q}caption${q}: ${q}" + replace(ifempty(1.message.caption; ""); "${q}"; "${eq}") + "${q} }";
      if(1.message.type = "document"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}document${q}: ${q}" + 1.message.document + "${q}, ${q}fileName${q}: ${q}" + replace(ifempty(1.message.fileName; "file"); "${q}"; "${eq}") + "${q}, ${q}caption${q}: ${q}" + replace(ifempty(1.message.caption; ""); "${q}"; "${eq}") + "${q} }";
      if(1.message.type = "link"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}linkUrl${q}: ${q}" + 1.message.linkUrl + "${q}, ${q}title${q}: ${q}" + replace(ifempty(1.message.title; ""); "${q}"; "${eq}") + "${q}, ${q}linkDescription${q}: ${q}" + replace(ifempty(1.message.linkDescription; ""); "${q}"; "${eq}") + "${q}, ${q}image${q}: ${q}" + 1.message.image + "${q} }";
      
      if(1.message.type = "poll"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}message${q}: ${q}" + replace(ifempty(1.message.pollName; "Enquete"); "${q}"; "${eq}") + "${q}, ${q}pollMaxOptions${q}: " + ifempty(1.message.selectableOptionsCount; 1) + ", ${q}poll${q}: [ { ${q}name${q}: ${q}" + join(1.message.pollOptions; "${q} }, { ${q}name${q}: ${q}") + "${q} } ] }";
      
      if(1.message.type = "ptv"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}video${q}: ${q}" + 1.message.video + "${q} }";
      if(1.message.type = "location"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}latitude${q}: ${q}" + 1.message.latitude + "${q}, ${q}longitude${q}: ${q}" + 1.message.longitude + "${q}, ${q}title${q}: ${q}" + replace(ifempty(1.message.title; ""); "${q}"; "${eq}") + "${q}, ${q}address${q}: ${q}" + replace(ifempty(1.message.address; ""); "${q}"; "${eq}") + "${q} }";
      if(1.message.type = "contact"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}contactName${q}: ${q}" + replace(ifempty(1.message.contactName; ""); "${q}"; "${eq}") + "${q}, ${q}contactPhone${q}: ${q}" + 1.message.contactPhone + "${q}, ${q}businessDescription${q}: ${q}" + replace(ifempty(1.message.businessDescription; ""); "${q}"; "${eq}") + "${q} }";
      if(1.message.type = "contacts"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}contacts${q}: " + ifempty(1.message.contacts; "[]") + " }";    
      if(1.message.type = "button-list"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}message${q}: ${q}" + replace(ifempty(1.message.text; ""); "${q}"; "${eq}") + "${q}, ${q}buttonList${q}: " + ifempty(1.message.buttonList; "{}") + " }";
      if(1.message.type = "button-list-image"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}image${q}: ${q}" + 1.message.image + "${q}, ${q}buttonList${q}: " + ifempty(1.message.buttonList; "{}") + " }";
      if(1.message.type = "option-list"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}message${q}: ${q}" + replace(ifempty(1.message.text; ""); "${q}"; "${eq}") + "${q}, ${q}title${q}: ${q}" + replace(ifempty(1.message.title; ""); "${q}"; "${eq}") + "${q}, ${q}footer${q}: ${q}" + replace(ifempty(1.message.footer; ""); "${q}"; "${eq}") + "${q}, ${q}buttonText${q}: ${q}" + replace(ifempty(1.message.buttonText; "Options"); "${q}"; "${eq}") + "${q}, ${q}optionList${q}: " + ifempty(1.message.optionList; "[]") + " }";
      if(1.message.type = "product"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}productId${q}: ${q}" + 1.message.productId + "${q} }";
      if(1.message.type = "catalog"; "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}message${q}: ${q}Catalog sending${q} }";
      "{ ${q}phone${q}: ${q}" + 1.to.phone + "${q}, ${q}delayMessage${q}: 1, ${q}message${q}: ${q}Unsupported type: " + 1.message.type + "${q} }"
      ))))))))))))))))
    }}`;

    httpModule.mapper.data = dynamicBody;

    console.log('Updating with FINAL body...');
    const updateRes = await fetch('https://us1.make.com/api/v2/scenarios/4547638?confirmed=true', {
        method: 'PATCH',
        headers: {
            'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blueprint: JSON.stringify(blueprint) })
    });
    
    if(updateRes.ok) console.log("Updated.");
    else console.log("Failed " + updateRes.status);
}

updateScenario();
