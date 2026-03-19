import{j as t}from"./jquery.module-gzd0YkcT.js";import{S as d}from"./sweetalert2.esm.all-BjNi2kua.js";t(document).ready(async function(){const o=t('button[id^="invite_"]');o.click(async function(){o.attr("disabled",!0);const i=t(this).attr("id")?.split("_")[1],s=t("#csrf_token").val(),n=await fetch(`/admin/recruits/${i}/invite`,{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":s,Accept:"application/json"},body:JSON.stringify({_token:s})}),e=await n.json();console.log(e),n.ok?d.fire({title:"Success",text:e.message,icon:"success",showConfirmButton:!0,confirmButtonText:"OK"}).then(a=>{a.isConfirmed&&globalThis.location.reload()}):await d.fire({title:"Error",text:e.message,icon:"error",timer:1500}),o.attr("disabled",!1)}),t("#copy_invitation_link").click(async function(){const i=t(this).val();t(this).attr("disabled",!0),i&&(navigator.clipboard.writeText(i),t(this).html('<i class="fa-solid fa-check"></i>'),setTimeout(()=>{t(this).attr("disabled",!1),t(this).html('<i class="fa-solid fa-copy"></i>')},3e3))}),t('button[id^="verify_"]').click(async function(){const i=`<span class="px-5 py-2 rounded-lg bg-gray-500 text-white font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Verifying...
                </span>`,s=`<span class="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-circle-check"></i>
                    Verified
                </span>`,n=`<button class="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-500/80 transition text-white font-semibold flex items-center gap-2" id="verify_{{ $recruit.ign }}">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    Verify
                </button>`,e=`<span class="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    Blocklisted
                </span>`;t("#verify_indicator").html(i);const a=t(this).attr("id")?.split("_")[1],c=t("#csrf_token").val(),r=await fetch(`/admin/recruits/${a}/verify`,{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":c,Accept:"application/json"},body:JSON.stringify({_token:c})}),l=await r.json();r.ok?l.verified===1?t("#verify_indicator").html(s):l.verified===2&&t("#verify_indicator").html(e):t("#verify_indicator").html(n)})});
