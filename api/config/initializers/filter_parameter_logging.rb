ActiveSupport.on_load(:active_record) do
  self.filter_attributes += [:password, :password_confirmation, :password_digest]
end
