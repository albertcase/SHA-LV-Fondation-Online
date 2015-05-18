# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
 
  config.vm.box = "ubuntu12.04-symfony2-20150518"

  config.vm.hostname = "LV-Fondation-Online"

  
  config.vm.network :forwarded_port, guest: 80, host: 9023
  config.vm.network :forwarded_port, guest: 3306, host: 33093
  
  config.vm.network :private_network, ip: "192.168.33.12"


  config.vm.synced_folder "./", "/vagrant", :nfs => true
  #config.vm.synced_folder "./", "/vagrant"


  config.vm.provider :virtualbox do |vb|
  #   # Don't boot with headless mode
  #   vb.gui = true
  #
  #   # Use VBoxManage to customize the VM. For example to change memory:
    vb.customize ["modifyvm", :id, "--memory", "1024"]
  end
  #

  #config.vm.provision :puppet do |puppet|
  #  puppet.module_path = "puppet/modules"
  #  puppet.manifests_path = "puppet/manifests"
  #  puppet.manifest_file  = "site.pp"
  #end

end
