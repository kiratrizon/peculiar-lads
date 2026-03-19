import{j as t}from"./jquery.module-gzd0YkcT.js";import{S as a}from"./sweetalert2.esm.all-BjNi2kua.js";t(document).ready(async function(){const n=t('button[id^="invite_"]');n.click(async function(){n.attr("disabled",!0);const i=t(this).attr("id")?.split("_")[1],e=t("#csrf_token").val(),s=await fetch(`/admin/recruits/${i}/invite`,{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":e,Accept:"application/json"},body:JSON.stringify({_token:e})}),o=await s.json();console.log(o),s.ok?a.fire({title:"Success",text:o.message,icon:"success",showConfirmButton:!0,confirmButtonText:"OK"}).then(c=>{c.isConfirmed&&globalThis.location.reload()}):await a.fire({title:"Error",text:o.message,icon:"error",timer:1500}),n.attr("disabled",!1)}),t("#copy_invitation_link").click(async function(){const i=t(this).val();t(this).attr("disabled",!0),i&&(navigator.clipboard.writeText(i),t(this).html('<i class="fa-solid fa-check"></i>'),setTimeout(()=>{t(this).attr("disabled",!1),t(this).html('<i class="fa-solid fa-copy"></i>')},3e3))}),t('button[id^="verify_"]').click(async function(){alert("verify");const i=`<span class="px-5 py-2 rounded-lg bg-gray-500 text-white font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Verifying...
                </span>`,e=`<span class="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-circle-check"></i>
                    Verified
                </span>`,s=`<span class="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    Blocklisted
                </span>`;t("#verify_indicator").html(i),setTimeout(()=>{Math.random()>.5?t("#verify_indicator").html(e):t("#verify_indicator").html(s)},1e3)})});
