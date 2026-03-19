Rails.application.config do
  config.session_store :cookie_store, key: "_api_session"
  config.middleware.use config.session_store, config.session_options
  config.middleware.use ActionDispatch::Cookies
end
