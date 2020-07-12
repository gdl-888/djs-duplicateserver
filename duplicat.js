function printf(...args) {
	const fmt = args[0];
	
    var retval = '';
    for(var i=0, j=1; i<fmt.length; ) {
        if(fmt[i] == '%') {
            switch(fmt[i+1]) {
				case '%':
					retval += '%';
				break; case 'd':
					const n = args[j++];
					
					if(typeof(n) == 'string') {
						retval += n.charCodeAt(0);
					} else {
						retval += Math.floor(n);
					}
				break; case 's':
					retval += String(args[j++]);
				break; case 'c':
					const c = args[j++];
					
					if(typeof(c) == 'number') {
						retval += String.fromCharCode(c);
					} else {
						retval += c;
					}
				break; case 'g':
					retval += Math.round(args[j++]);
				break; case 'f':
					retval += args[j++];
				break; case 'o':
					retval += args[j++].toString(8);
				break; case 'x':
					retval += args[j++].toString(16);
				break; case 'X':
					retval += args[j++].toString(16).toUpperCase();
			}
			
			i += 2;
		} else {
			retval += fmt[i];
			i++;
		}
	}
	
	console.log(retval);
	
	return 0;
}

const DJS11 = require('djs11');  // npm i djs11@npm:discord.js@11.6.4

function print(x) { console.log(x); }
function prt(x) { process.stdout.write(x); }
function input(p) { prt(p); return require('wait-console-input').readLine(''); }

const client = new DJS11.Client();
const token = '333';

client.login(token);

var gn = '-1', gr = '-1';

client.on('ready', async function() {
	// 혹시 모르니..
	client.user.setPresence({
		status: "invisible"
	});
	
	var s  = 1;
	var sl = [];
	
	for(server of client.guilds.array())
		{
			print(`[${s}] ${server['name']}`);
			sl.push(s++);
		}
	
	var guildname = input("대상 서버: ");
		
	if(!sl.includes(Number(guildname))) {
		print('\r\n서버가 존재하지 않습니다.');
		return;
	}
	
	const guild = client.guilds.array()[Number(guildname) - 1];
	prt('\r\n');
	
	var time = 750;
	
	print("<<< 서버를 만듭니다.");
	const clone = await client.user.createGuild(`${guild.name}의 클론`);
	
	print("<<< 역할을 복제합니다.");
	
	var roles = {};
	
	time = 1500;
	guild.roles.forEach(r => {
		setTimeout(async () => {
			print("<<< 복제: " + r.name);
			var role = await clone.createRole({  // 일부러 그냥 r를 넘기지 않음
				name: r.name,
				color: r.color,
				hoist: r.hoist,
				position: r.position,
				permissions: r.permissions,
				mentionable: r.mentionable
			});
			roles[r.id] = role.id;
		}, time);
		time += 1500;
	});

	var timer = setInterval(() => {
		if(Object.keys(roles).length == guild.roles.size) {
			print("<<< 채널을 복제합니다.");
	
			time = 1500;
			guild.channels.forEach(c => {
				setTimeout(() => {
					print("<<< 복제: " + c.name);
					
					var po = [];
					
					c.permissionOverwrites.forEach(p => {
						po.push({
							id: p.type == 'role' ? roles[p.id] : p.id,
							type: p.type,
							deny: p.deny,
							allow: p.allow,
							denied: p.denied,
							allowed: p.allowed
						});
					});
					
					clone.createChannel(c.name, {  // 일부러 그냥 c를 넘기지 않음
						type: c.type,
						name: c.name,
						position: c.position,
						topic: c.topic,
						nsfw: c.nsfw,
						userLimit: c.userLimit,
						permissionOverwrites: po,
						rateLimitPerUser: c.rateLimitPerUser
					});
				}, time);
				time += 1500;
			});
			
			clone.createRole({
				name: "최고 관리자",
				color: "#00C8C8",
				permissions: 8,
				hoist: true
			}).then(r => {
				gr = r.id;
				
				clone.channels.last().createInvite({
					maxAge: 86400
				}).then(i => printf("<<< 서버 초대 코드는 %s입니다. 접속하면 소유권이 당신으로 넘어갑니다.", i.code));
			});
			
			gn = clone.id;
			
			clearInterval(timer);
		}
	}, 1500);
});

client.on('guildMemberAdd', member => {
	if(member.guild.id == gn) {
		member.addRole(gr).then(x => {
			client.guilds.get(gn).setOwner(member);
		});
	}
});
